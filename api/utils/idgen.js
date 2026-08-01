import prisma from '../prisma.js';

/**
 * Generate next member ID: MSSN-FUTB-XXXX
 */
export async function generateMemberId() {
  const last = await prisma.member.findFirst({
    orderBy: { id: 'desc' },
    select: { memberId: true }
  });

  let next = 1;
  if (last?.memberId) {
    const parts = last.memberId.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num)) next = num + 1;
  }

  return `MSSN-FUTB-${String(next).padStart(4, '0')}`;
}
