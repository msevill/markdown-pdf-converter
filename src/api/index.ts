import express from 'express';
import { json } from 'body-parser';
import jobsRouter from './jobs';

const app = express();
app.use(json());

app.use('/jobs', jobsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
