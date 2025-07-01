import { Pool } from 'pg';

// Use environment variables for DB config
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optionally add ssl: { rejectUnauthorized: false } for managed DBs
});

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export interface Job {
  id: string;
  status: JobStatus;
  markdown?: string;
  fileUrl?: string;
  s3Url?: string;
  error?: string;
  created_at?: Date;
  updated_at?: Date;
}

export async function saveJob(job: Job): Promise<void> {
  await pool.query(
    `INSERT INTO jobs (id, status, markdown, file_url, s3_url, error, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
    [job.id, job.status, job.markdown || null, job.fileUrl || null, job.s3Url || null, job.error || null]
  );
}

export async function updateJobStatus(id: string, status: JobStatus, s3Url?: string, error?: string): Promise<void> {
  await pool.query(
    `UPDATE jobs SET status = $2, s3_url = $3, error = $4, updated_at = NOW() WHERE id = $1`,
    [id, status, s3Url || null, error || null]
  );
}

export async function getJobById(id: string): Promise<Job | null> {
  const res = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
  if (res.rows.length === 0) return null;
  return res.rows[0];
}
