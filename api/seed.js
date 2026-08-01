import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from './prisma.js';

async function seed() {
  console.log('🌱 Seeding MSSN database...');

  // Create admin account
  const existing = await prisma.member.findUnique({ where: { email: 'admin@mssn-futb.com' } });
  if (!existing) {
    const hash = await bcrypt.hash('Admin@MSSN2025', 10);
    await prisma.member.create({
      data: {
        memberId: 'MSSN-FUTB-0000',
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@mssn-futb.com',
        phone: '09000000000',
        password: hash,
        role: 'admin',
        position: 'System Administrator',
        session: process.env.SESSION_YEAR || '2025/2026'
      }
    });
    console.log('✅ Admin created: admin@mssn-futb.com / Admin@MSSN2025');
  } else {
    console.log('ℹ️  Admin already exists, skipping.');
  }

  await prisma.$disconnect();
  console.log('✅ Seeding complete!');
}

seed().catch((e) => { console.error(e); process.exit(1); });
