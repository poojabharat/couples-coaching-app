import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { authMiddleware } from './middleware/auth.js';
import couplesRouter from './routes/couples.js';
import assessmentsRouter from './routes/assessments.js';
import submissionsRouter from './routes/submissions.js';
import responsesRouter from './routes/responses.js';
import reportRouter from './routes/report.js';
import consentsRouter from './routes/consents.js';
import planRouter from './routes/plan.js';
import coachRouter from './routes/coach.js';

const app = express();

app.use(cors({
  origin: '*', // TODO: lock down to your frontend origin(s)
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// All routes require user auth (Supabase JWT)
app.use(authMiddleware);

app.use('/couples', couplesRouter);
app.use('/assessments', assessmentsRouter);
app.use('/submissions', submissionsRouter);
app.use('/responses', responsesRouter);
app.use('/consents', consentsRouter);
app.use('/plan', planRouter);
app.use('/coach', coachRouter);
app.use('/report', reportRouter);

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve frontend (Vite build) in production
const distPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));

