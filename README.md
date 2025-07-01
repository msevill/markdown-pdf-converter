# Markdown PDF Job API

This project is a cloud-native API for submitting Markdown-to-PDF conversion jobs, querying job status, and retrieving generated PDFs. It uses Node.js, Express, TypeScript, AWS Lambda, SQS, PostgreSQL, S3, and CloudFormation for infrastructure as code.

## Features

- Submit Markdown conversion jobs via REST API
- Asynchronous processing with SQS and Lambda
- PDF storage in S3 with pre-signed URL access
- Job status tracking in PostgreSQL
- Infrastructure managed via CloudFormation

## Getting Started

1. Install dependencies: `npm install`
2. Build the project: `npm run build`
3. Configure AWS credentials and PostgreSQL connection
4. Deploy infrastructure: `npm run deploy` (or use Serverless Framework/Terraform)
5. Start the API locally: `npm run start`

## Project Structure

- `src/api` - Express API handlers
- `src/lambda` - Lambda job processor
- `src/services` - SQS, S3, DB, PDF logic
- `infrastructure` - CloudFormation templates
- `.github` - Copilot instructions

## Requirements

- Node.js 18+
- AWS CLI configured
- PostgreSQL instance

## License

MIT
