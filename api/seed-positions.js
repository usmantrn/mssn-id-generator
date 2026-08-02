import 'dotenv/config';
import prisma from './prisma.js';

const POSITIONS = [
  'Amir', 'Naib Amir', 'Secretary',
  'Director of Strategy', 'Director of Education', 'Director of Women Affairs',
  'Director of Financial Secretary', 'Treasurer', 'Director of Operation',
  'Director of ICT', 'Director of Welfare', "Director of Da'awah",
  // Assistants
  'Asst. Amir', 'Asst. Naib Amir', 'Asst. Secretary',
  'Asst. Director of Strategy', 'Asst. Director of Education', 'Asst. Director of Women Affairs',
  'Asst. Director of Financial Secretary', 'Asst. Treasurer', 'Asst. Director of Operation',
  'Asst. Director of ICT', 'Asst. Director of Welfare', "Asst. Director of Da'awah",
  // New Roles
  'PRO I', 'PRO II'
];

async function seedPositions() {
  console.log('🌱 Seeding Positions...');

  for (const posName of POSITIONS) {
    const existing = await prisma.position.findUnique({ where: { name: posName } });
    if (!existing) {
      await prisma.position.create({
        data: { name: posName }
      });
      console.log(`✅ Added position: ${posName}`);
    } else {
      console.log(`ℹ️  Position already exists: ${posName}, skipping.`);
    }
  }

  await prisma.$disconnect();
  console.log('✅ Positions seeding complete!');
}

seedPositions().catch((e) => { console.error(e); process.exit(1); });
