import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- WALLETS ---');
  const wallets = await prisma.wallet.findMany();
  console.log(wallets);

  console.log('\n--- TRANSACTIONS ---');
  const txs = await prisma.walletTransaction.findMany({ take: 5, orderBy: { id: 'desc' } });
  console.log(txs);

  console.log('\n--- BOOKINGS ---');
  const bookings = await prisma.booking.findMany({ 
    take: 5, 
    orderBy: { id: 'desc' }, 
    include: { room: { include: { hotel: { include: { vendor: true } } } } }
  });
  bookings.forEach(b => {
    console.log(`Booking ID: ${b.id}, Vendor: ${b.room.hotel.vendor?.id || 'null'}, Status: ${b.status}`);
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); });
