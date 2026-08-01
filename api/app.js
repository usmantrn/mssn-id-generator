import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth.js';
import membersRouter from './routes/members.js';
import adminRouter from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5174', credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static files
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/cards', express.static(path.join(__dirname, '../uploads/cards')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/members', membersRouter);
app.use('/api/admin', adminRouter);

// Public verify endpoint
import { verifyMember } from './services/idcard.service.js';
app.get('/api/verify/:memberId', async (req, res) => {
  try {
    const member = await verifyMember(req.params.memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', system: 'MSSN-ID-Generator' }));

export default app;
