"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = uploadToS3;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3 = new client_s3_1.S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_BUCKET;
// S3 service stub for uploading PDFs
// Replace with real AWS SDK integration
async function uploadToS3(jobId, pdfBuffer) {
    const key = `${jobId}.pdf`;
    await s3.send(new client_s3_1.PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
    }));
    const url = await (0, s3_request_presigner_1.getSignedUrl)(s3, new client_s3_1.GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 60 * 60 });
    return url;
}
