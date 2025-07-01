import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({ region: process.env.AWS_REGION });
const QUEUE_URL = process.env.SQS_QUEUE_URL!;

export interface EnqueueJobInput {
  id: string;
  markdown?: string;
  fileUrl?: string;
}

export async function enqueueJob(job: EnqueueJobInput): Promise<void> {
  const command = new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(job),
  });
  await sqs.send(command);
}
