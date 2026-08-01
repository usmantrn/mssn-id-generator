import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { generateMemberId } from '../utils/idgen.js';

const router = express.Router();

// Capitalize each word: "john doe" -> "John Doe"
function toTitleCase(str) {
  if (!str) return str;
  return str.trim().replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Uppercase a whole string (for matric no)
function toUpperStr(str) {
  if (!str) return str;
  return str.trim().toUpperCase();
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, phone, password, matricNo, department, level } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await prisma.member.findFirst({
      where: { OR: [{ email }, { phone }] }
    });
    if (existing) {
      return res.status(400).json({ error: existing.email === email ? 'Email already registered' : 'Phone already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const memberId = await generateMemberId();
    const session = process.env.SESSION_YEAR || '2025/2026';

    const member = await prisma.member.create({
      data: {
        memberId,
        firstName: toTitleCase(firstName),
        middleName: middleName ? toTitleCase(middleName) : null,
        lastName: toTitleCase(lastName),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: hash,
        session,
        matricNo: toUpperStr(matricNo) || null,
        department: toTitleCase(department) || null,
        level: level || null
      }
    });

    const { password: _, ...safe } = member;
    res.status(201).json({ success: true, message: 'Registration successful! You can now log in.', member: safe });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const member = await prisma.member.findUnique({ where: { email } });
    if (!member) return res.status(401).json({ error: 'Invalid email or password' });

    if (member.status === 'suspended') return res.status(403).json({ error: 'Your account has been suspended. Contact admin.' });

    const valid = await bcrypt.compare(password, member.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: member.id, memberId: member.memberId, email: member.email, role: member.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safe } = member;
    res.json({ success: true, token, member: safe });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me
import { authenticate } from '../middleware/auth.js';
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
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
