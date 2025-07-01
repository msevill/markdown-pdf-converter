"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveJob = saveJob;
exports.updateJobStatus = updateJobStatus;
exports.getJobById = getJobById;
const pg_1 = require("pg");
// Use environment variables for DB config
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    // Optionally add ssl: { rejectUnauthorized: false } for managed DBs
});
async function saveJob(job) {
    await pool.query(`INSERT INTO jobs (id, status, markdown, file_url, s3_url, error, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`, [job.id, job.status, job.markdown || null, job.fileUrl || null, job.s3Url || null, job.error || null]);
}
async function updateJobStatus(id, status, s3Url, error) {
    await pool.query(`UPDATE jobs SET status = $2, s3_url = $3, error = $4, updated_at = NOW() WHERE id = $1`, [id, status, s3Url || null, error || null]);
}
async function getJobById(id) {
    const res = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (res.rows.length === 0)
        return null;
    return res.rows[0];
}
