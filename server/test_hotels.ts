import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pending = await prisma.hotel.findMany({ where: { approvalStatus: 'PENDING' } });
  console.log("Pending:", pending.length);
  const all = await prisma.hotel.findMany();
  console.log("All:", all.length);
  const statusCounts = {};
  for(const h of all) {
    statusCounts[h.approvalStatus] = (statusCounts[h.approvalStatus] || 0) + 1;
  }
  console.log("Status breakdown:", statusCounts);
}
main().finally(() => prisma.$disconnect());
