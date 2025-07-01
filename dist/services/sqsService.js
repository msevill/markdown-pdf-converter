"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueJob = enqueueJob;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const sqs = new client_sqs_1.SQSClient({ region: process.env.AWS_REGION });
const QUEUE_URL = process.env.SQS_QUEUE_URL;
async function enqueueJob(job) {
    const command = new client_sqs_1.SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(job),
    });
    await sqs.send(command);
}
