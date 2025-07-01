import { promises as fs } from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { Readable } from 'stream';

export interface PdfServiceOptions {
  markdown: string;
  fileUrl?: string;
}

/**
 * Converts Markdown to PDF using Puppeteer and GitHub-style CSS.
 * Returns a Buffer containing the PDF.
 */
export async function convertMarkdownToPdf({ markdown, fileUrl }: PdfServiceOptions): Promise<Buffer> {
  let mdContent = markdown;
  if (fileUrl) {
    // Stream download for large files
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error('Failed to fetch Markdown file');
    const reader = res.body?.getReader();
    if (!reader) throw new Error('No body in fetch response');
    const chunks: Uint8Array[] = [];
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) chunks.push(value);
      done = readerDone;
    }
    mdContent = Buffer.concat(chunks).toString('utf-8');
  }
  // Dynamically import marked for SSR safety
  const { marked } = await import('marked');
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
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await page.close();
    // Ensure return type is Buffer for compatibility
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();  }
}
