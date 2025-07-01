import { SQSEvent, SQSHandler } from 'aws-lambda';
import { convertMarkdownToPdf } from '../services/pdfService';
import { uploadToS3 } from '../services/s3Service';
import { updateJobStatus } from '../services/dbService';

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const { id, markdown, fileUrl } = JSON.parse(record.body);
    try {
      await updateJobStatus(id, 'PROCESSING');
      const pdfBuffer = await convertMarkdownToPdf({ markdown, fileUrl });
      const s3Url = await uploadToS3(id, pdfBuffer);
      await updateJobStatus(id, 'COMPLETED', s3Url);
      console.log(`Processed job ${id}`);
    } catch (err: any) {
      await updateJobStatus(id, 'FAILED', undefined, err.message);
      console.error(`Failed job ${id}:`, err);
    }
  }
};
