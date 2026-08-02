import prisma from '../prisma.js';

export async function verifyMember(memberId) {
  const member = await prisma.member.findUnique({
    where: { memberId },
    select: {
      memberId: true, firstName: true, middleName: true, lastName: true,
      role: true, position: true, session: true,
      photoUrl: true, expiryDate: true, issueDate: true, status: true
    }
  });
  return member;
}
