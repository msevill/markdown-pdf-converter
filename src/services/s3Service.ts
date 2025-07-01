import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_BUCKET!;

// S3 service stub for uploading PDFs
// Replace with real AWS SDK integration
export async function uploadToS3(jobId: string, pdfBuffer: Buffer): Promise<string> {
  const key = `${jobId}.pdf`;
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
  }));
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: 60 * 60 }
  );
  return url;
}
