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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMarkdownToPdf = convertMarkdownToPdf;
const puppeteer_1 = __importDefault(require("puppeteer"));
/**
 * Converts Markdown to PDF using Puppeteer and GitHub-style CSS.
 * Returns a Buffer containing the PDF.
 */
async function convertMarkdownToPdf({ markdown, fileUrl }) {
    let mdContent = markdown;
    if (fileUrl) {
        // Fetch file content from URL
        const res = await fetch(fileUrl);
        if (!res.ok)
            throw new Error('Failed to fetch Markdown file');
        mdContent = await res.text();
    }
    // Dynamically import marked for SSR safety
    const { marked } = await Promise.resolve().then(() => __importStar(require('marked')));
    const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown.min.css">
        <style>body { box-sizing: border-box; margin: 40px; }</style>
      </head>
      <body class="markdown-body">${marked(mdContent)}</body>
    </html>
  `;
    const browser = await puppeteer_1.default.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await page.close();
        // Ensure return type is Buffer for compatibility
        return Buffer.from(pdfBuffer);
    }
    finally {
        await browser.close();
    }
}
