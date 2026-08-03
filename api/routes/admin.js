import express from 'express';
import { put } from '@vercel/blob';
import { parse } from 'csv-parse/sync';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import prisma from '../prisma.js';
import { generateMemberId } from '../utils/idgen.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authenticate, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (_, res) => {
  try {
    const [total, officials, members, cardsGenerated] = await Promise.all([
      prisma.member.count({ where: { role: { not: 'admin' } } }),
      prisma.member.count({ where: { role: 'official' } }),
      prisma.member.count({ where: { role: 'member' } }),
      prisma.member.count({ where: { cardGenerated: true, role: { not: 'admin' } } })
    ]);
    res.json({ success: true, stats: { total, officials, members, cardsGenerated } });
  } catch { res.status(500).json({ error: 'Failed to fetch stats' }); }
});

// GET /api/admin/members
router.get('/members', async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const where = {
      role: { not: 'admin' },
      ...(role && role !== 'all' && { role }),
      ...(search && {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { memberId: { contains: search } },
          { email: { contains: search } }
        ]
      })
    };
    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where, skip: (page - 1) * limit, take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, memberId: true, firstName: true, middleName: true, lastName: true,
          email: true, phone: true, role: true, position: true,
          session: true, photoUrl: true, cardGenerated: true,
          expiryDate: true, issueDate: true, status: true, createdAt: true
        }
      }),
      prisma.member.count({ where })
    ]);
    res.json({ success: true, members, total, pages: Math.ceil(total / limit) });
  } catch { res.status(500).json({ error: 'Failed to fetch members' }); }
});

// GET /api/admin/members/:id
router.get('/members/:id', async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true, memberId: true, firstName: true, lastName: true,
        email: true, phone: true, role: true, position: true,
        matricNo: true, department: true, level: true,
        session: true, photoUrl: true, cardUrl: true, cardGenerated: true,
        expiryDate: true, issueDate: true, status: true, createdAt: true
      }
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json({ success: true, member });
  } catch { res.status(500).json({ error: 'Failed to fetch member' }); }
});

// PUT /api/admin/members/:id/role
router.put('/members/:id/role', async (req, res) => {
  try {
    const { role, position } = req.body;
    const validRoles = ['member', 'official'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const expiryDate = role === 'official' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null;
    const member = await prisma.member.update({
      where: { id: Number(req.params.id) },
      data: { role, position: role === 'official' ? position : null, expiryDate, cardGenerated: false }
    });
    const { password: _, ...safe } = member;
    res.json({ success: true, message: `Member updated to ${role}`, member: safe });
  } catch { res.status(500).json({ error: 'Role update failed' }); }
});

// PUT /api/admin/members/:id/status
router.put('/members/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const member = await prisma.member.update({ where: { id: Number(req.params.id) }, data: { status } });
    const { password: _, ...safe } = member;
    res.json({ success: true, member: safe });
  } catch { res.status(500).json({ error: 'Status update failed' }); }
});

// POST /api/admin/members/:id/generate-card
router.post('/members/:id/generate-card', async (req, res) => {
  try {
    const member = await prisma.member.update({ 
      where: { id: Number(req.params.id) }, 
      data: { cardGenerated: true } 
    });
    res.json({ success: true, message: 'Card marked as generated' });
  } catch (err) {
    console.error('Admin card gen error:', err);
    res.status(500).json({ error: 'Card generation failed' });
  }
});

// DELETE /api/admin/members/:id
router.delete('/members/:id', async (req, res) => {
  try {
    const member = await prisma.member.findUnique({ where: { id: Number(req.params.id) } });
    if (!member) return res.status(404).json({ error: 'Member not found' });

    // Log the deletion before removing
    await prisma.deletionLog.create({
      data: {
        memberId:      member.memberId,
        firstName:     member.firstName,
        middleName:    member.middleName,
        lastName:      member.lastName,
        email:         member.email,
        phone:         member.phone,
        role:          member.role,
        position:      member.position || null,
        session:       member.session || null,
        matricNo:      member.matricNo || null,
        department:    member.department || null,
        level:         member.level || null,
        deletedById:   req.user.memberId,
        deletedByName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
      }
    });

    await prisma.member.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true, message: 'Member deleted and deletion logged' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// POST /api/admin/bulk-upload (CSV)
router.post('/bulk-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const content = req.file.buffer.toString('utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });

    let created = 0, skipped = 0, errors = [];
    for (const row of records) {
      try {
        const { firstName, lastName, email, phone, password } = row;
        if (!firstName || !lastName || !email || !phone) { skipped++; continue; }

        const exists = await prisma.member.findFirst({ where: { OR: [{ email }, { phone }] } });
        if (exists) { skipped++; continue; }

        const hash = await bcrypt.hash(password || 'MSSN@2025', 10);
        const memberId = await generateMemberId();
        await prisma.member.create({
          data: { memberId, firstName, lastName, email, phone, password: hash, session: process.env.SESSION_YEAR || '2025/2026' }
        });
        created++;
      } catch (e) { errors.push({ row, error: e.message }); }
    }
    res.json({ success: true, created, skipped, errors: errors.length, errorDetails: errors.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ error: 'Bulk upload failed: ' + err.message });
  }
});

// POST /api/admin/members (create directly)
router.post('/members', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, position } = req.body;
    if (!firstName || !lastName || !email || !phone) return res.status(400).json({ error: 'Required fields missing' });

    const exists = await prisma.member.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (exists) return res.status(400).json({ error: 'Email or phone already exists' });

    const hash = await bcrypt.hash(password || 'MSSN@2025', 10);
    const memberId = await generateMemberId();
    const expiryDate = role === 'official' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null;

    const member = await prisma.member.create({
      data: {
        memberId, firstName, lastName, email, phone, password: hash,
        role: role || 'member', position: position || null, expiryDate,
        session: process.env.SESSION_YEAR || '2025/2026'
      }
    });
    const { password: _, ...safe } = member;
    res.status(201).json({ success: true, member: safe });
  } catch (err) {
    res.status(500).json({ error: 'Create failed: ' + err.message });
  }
});

import { processMemberPhoto } from '../utils/cloudinary.js';

// POST /api/admin/members/:id/process-photo
router.post('/members/:id/process-photo', authenticate, requireAdmin, async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true, memberId: true, photoUrl: true }
    });

    if (!member || !member.photoUrl) {
      return res.status(400).json({ error: 'No photo uploaded yet.' });
    }

    const newPhotoUrl = await processMemberPhoto(member.photoUrl, member.memberId);

    const updatedMember = await prisma.member.update({
      where: { id: Number(req.params.id) },
      data: { photoUrl: newPhotoUrl }
    });

    res.json({ success: true, photoUrl: updatedMember.photoUrl });
  } catch (err) {
    console.error('Admin photo processing error:', err);
    res.status(500).json({ error: 'Photo enhancement failed.' });
  }
});

// POST /api/admin/members/:id/photo  (admin-only photo update)
router.post('/members/:id/photo', authenticate, requireAdmin, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });

    const filename = `${Date.now()}-admin-${req.params.id}.jpg`;

    const blob = await put(`photos/${filename}`, req.file.buffer, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    await prisma.member.update({
      where: { id: Number(req.params.id) },
      data: { photoUrl: blob.url, cardGenerated: false }
    });
    res.json({ success: true, photoUrl: blob.url });
  } catch (err) {
    console.error('Admin photo upload error:', err);
    res.status(500).json({ error: 'Photo upload failed' });
  }
});

// GET /api/admin/deletion-logs
router.get('/deletion-logs', async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const [logs, total] = await Promise.all([
      prisma.deletionLog.findMany({
        orderBy: { deletedAt: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit)
      }),
      prisma.deletionLog.count()
    ]);
    res.json({ success: true, logs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deletion logs' });
  }
});

// POST /api/admin/settings/signature
router.post('/settings/signature', upload.single('signature'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No signature file uploaded' });
    
    await put('card-assets/amir-sig.png', req.file.buffer, {
      access: 'public',
      contentType: 'image/png',
      addRandomSuffix: false // always overwrite amir-sig.png
    });

    res.json({ success: true, message: 'Signature updated successfully' });
  } catch (err) {
    console.error('Signature upload error:', err);
    res.status(500).json({ error: 'Signature upload failed' });
  }
});

// --- POSITIONS / ROLES ---

// GET /api/admin/positions
router.get('/positions', async (req, res) => {
  try {
    const positions = await prisma.position.findMany({ orderBy: { id: 'asc' } });
    res.json({ success: true, positions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

// POST /api/admin/positions
router.post('/positions', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Position name is required' });
    
    const exists = await prisma.position.findUnique({ where: { name: name.trim() } });
    if (exists) return res.status(400).json({ error: 'Position already exists' });
    
    const position = await prisma.position.create({ data: { name: name.trim() } });
    res.json({ success: true, position });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create position' });
  }
});

// DELETE /api/admin/positions/:id
router.delete('/positions/:id', async (req, res) => {
  try {
    await prisma.position.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true, message: 'Position deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete position' });
  }
});

export default router;
