"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const sqsService_1 = require("../services/sqsService");
const dbService_1 = require("../services/dbService");
const router = (0, express_1.Router)();
// POST /jobs - Submit a Markdown job
router.post('/', async (req, res) => {
    const { markdown, fileUrl } = req.body;
    // Input validation
    if ((!markdown || typeof markdown !== 'string' || markdown.length === 0) && !fileUrl) {
        return res.status(400).json({ error: 'Provide a non-empty markdown string or fileUrl.' });
    }
    if (markdown && markdown.length > 10 * 1024) {
        return res.status(400).json({ error: 'Markdown input exceeds 10KB limit.' });
    }
    // Generate job
    const jobId = (0, uuid_1.v4)();
    const job = {
        id: jobId,
        status: 'PENDING',
        markdown,
        fileUrl,
    };
    await (0, dbService_1.saveJob)(job);
    await (0, sqsService_1.enqueueJob)({ id: jobId, markdown, fileUrl });
    res.status(202).json({ jobId, status: 'PENDING' });
});
// GET /jobs/:id - Query job status
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const job = await (0, dbService_1.getJobById)(id);
    if (!job)
        return res.status(404).json({ error: 'Job not found' });
    if (job.status === 'COMPLETED')
        return res.json({ status: job.status, url: job.s3Url });
    if (job.status === 'FAILED')
        return res.json({ status: job.status, error: job.error });
    return res.json({ status: job.status });
});
// POST /convert - On-demand Markdown to PDF conversion
router.post('/convert', async (req, res) => {
    const { markdown, fileUrl } = req.body;
    if ((!markdown || typeof markdown !== 'string' || markdown.length === 0) && !fileUrl) {
        return res.status(400).json({ error: 'Provide a non-empty markdown string or fileUrl.' });
    }
    try {
        // Dynamically import the PDF service for testability
        const { convertMarkdownToPdf } = await Promise.resolve().then(() => __importStar(require('../services/pdfService')));
        const pdfBuffer = await convertMarkdownToPdf({ markdown, fileUrl });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
        res.send(pdfBuffer);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
