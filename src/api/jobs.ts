import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { enqueueJob } from '../services/sqsService';
import { saveJob, getJobById, Job } from '../services/dbService';

const router = Router();

// POST /jobs - Submit a Markdown job
router.post('/', async (req: Request, res: Response) => {
  const { markdown, fileUrl } = req.body;
  // Input validation
  if ((!markdown || typeof markdown !== 'string' || markdown.length === 0) && !fileUrl) {
    return res.status(400).json({ error: 'Provide a non-empty markdown string or fileUrl.' });
  }
  if (markdown && markdown.length > 10 * 1024) {
    return res.status(400).json({ error: 'Markdown input exceeds 10KB limit.' });
  }
  // Generate job
  const jobId = uuidv4();
  const job: Job = {
    id: jobId,
    status: 'PENDING',
    markdown,
    fileUrl,
  };
  await saveJob(job);
  await enqueueJob({ id: jobId, markdown, fileUrl });
  res.status(202).json({ jobId, status: 'PENDING' });
});

// GET /jobs/:id - Query job status
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const job = await getJobById(id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status === 'COMPLETED') return res.json({ status: job.status, url: job.s3Url });
  if (job.status === 'FAILED') return res.json({ status: job.status, error: job.error });
  return res.json({ status: job.status });
});

// POST /convert - On-demand Markdown to PDF conversion
router.post('/convert', async (req: Request, res: Response) => {
  const { markdown, fileUrl } = req.body;
  if ((!markdown || typeof markdown !== 'string' || markdown.length === 0) && !fileUrl) {
    return res.status(400).json({ error: 'Provide a non-empty markdown string or fileUrl.' });
  }
  try {
    // Dynamically import the PDF service for testability
    const { convertMarkdownToPdf } = await import('../services/pdfService');
    const pdfBuffer = await convertMarkdownToPdf({ markdown, fileUrl });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
