import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';
import prisma from '../prisma.js';
import { generateCardPdf } from '../services/idcard.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Capitalize each word
function toTitleCase(str) {
  if (!str) return str;
  return str.trim().replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Uppercase a whole string
function toUpperStr(str) {
  if (!str) return str;
  return str.trim().toUpperCase();
}

// Store raw uploads in memory, process with sharp before saving
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const PHOTOS_DIR = path.join(__dirname, '../../uploads/photos');

async function processAndSavePhoto(buffer, filename) {
  // Ensure directory exists
  if (!fs.existsSync(PHOTOS_DIR)) fs.mkdirSync(PHOTOS_DIR, { recursive: true });

  const outputPath = path.join(PHOTOS_DIR, filename);

  // Process: resize to passport dimensions (320x400px), add a clean white background,
  // sharpen, and normalize brightness — makes any photo look clean and professional
  await sharp(buffer)
    .resize(320, 400, {
      fit: 'cover',       // crop to fill exactly
      position: 'top'     // bias toward face (top of image)
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } }) // white bg for transparent PNGs
    .modulate({ brightness: 1.05, saturation: 1.1 })      // slightly brighten & saturate
    .sharpen({ sigma: 0.8 })                               // crisp details
    .jpeg({ quality: 92 })
    .toFile(outputPath);

  return outputPath;
}

// GET /api/members/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, memberId: true, firstName: true, middleName: true, lastName: true,
        email: true, phone: true, role: true, position: true,
        matricNo: true, department: true, level: true,
        session: true, photoUrl: true, cardUrl: true, cardGenerated: true,
        expiryDate: true, issueDate: true, status: true, createdAt: true
      }
    });
    if (!member) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, member });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/members/me
router.put('/me', authenticate, async (req, res) => {
  try {
    const { firstName, middleName, lastName, phone, matricNo, department, level } = req.body;
    const member = await prisma.member.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName: toTitleCase(firstName) }),
        ...(middleName !== undefined && { middleName: middleName ? toTitleCase(middleName) : null }),
        ...(lastName && { lastName: toTitleCase(lastName) }),
        ...(phone && { phone: phone.trim() }),
        ...(matricNo !== undefined && { matricNo: toUpperStr(matricNo) || null }),
        ...(department !== undefined && { department: toTitleCase(department) || null }),
        ...(level !== undefined && { level: level || null }),
      }
    });
    const { password: _, ...safe } = member;
    res.json({ success: true, member: safe });
  } catch { res.status(500).json({ error: 'Update failed' }); }
});

// POST /api/members/me/photo
router.post('/me/photo', authenticate, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });

    // Check if member already has a photo — only admin can change it after first upload
    const existing = await prisma.member.findUnique({ where: { id: req.user.id }, select: { photoUrl: true } });
    if (existing?.photoUrl) {
      return res.status(403).json({
        error: 'Photo already uploaded. Please contact the admin to update your photo.'
      });
    }

    const filename = `${Date.now()}-${req.user.id}.jpg`;
    await processAndSavePhoto(req.file.buffer, filename);

    const photoUrl = `/api/uploads/photos/${filename}`;
    await prisma.member.update({ where: { id: req.user.id }, data: { photoUrl, cardGenerated: false } });
    res.json({ success: true, photoUrl });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ error: 'Photo upload failed' });
  }
});

// POST /api/members/me/generate-card
router.post('/me/generate-card', authenticate, async (req, res) => {
  try {
    const member = await prisma.member.findUnique({ where: { id: req.user.id } });
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const cardUrl = await generateCardPdf(member);
    await prisma.member.update({ where: { id: req.user.id }, data: { cardUrl, cardGenerated: true } });
    res.json({ success: true, cardUrl });
  } catch (err) {
    console.error('Card generation error:', err);
    res.status(500).json({ error: 'Card generation failed. Please try again.' });
  }
});

export default router;
