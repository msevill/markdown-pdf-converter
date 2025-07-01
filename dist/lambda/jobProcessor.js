"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const pdfService_1 = require("../services/pdfService");
const s3Service_1 = require("../services/s3Service");
const dbService_1 = require("../services/dbService");
const handler = async (event) => {
    for (const record of event.Records) {
        const { id, markdown, fileUrl } = JSON.parse(record.body);
        try {
            await (0, dbService_1.updateJobStatus)(id, 'PROCESSING');
            const pdfBuffer = await (0, pdfService_1.convertMarkdownToPdf)({ markdown, fileUrl });
            const s3Url = await (0, s3Service_1.uploadToS3)(id, pdfBuffer);
            await (0, dbService_1.updateJobStatus)(id, 'COMPLETED', s3Url);
            console.log(`Processed job ${id}`);
        }
        catch (err) {
            await (0, dbService_1.updateJobStatus)(id, 'FAILED', undefined, err.message);
            console.error(`Failed job ${id}:`, err);
        }
    }
};
exports.handler = handler;
