import prisma from '@/config/database';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'John',
      lastName: 'Doe',
      phone: '0123456789',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '0987654321',
    },
  });

  console.log('✅ Created 2 users');

  // Create sample hotels
  const hotel1 = await prisma.hotel.create({
    data: {
      name: 'Luxury Hotel Downtown',
      description: 'A premium 5-star hotel in the heart of the city',
      location: 'Downtown',
      city: 'New York',
      country: 'USA',
      amenities: JSON.stringify(['WiFi', 'Pool', 'Gym', 'Restaurant']),
    },
  });

  const hotel2 = await prisma.hotel.create({
    data: {
      name: 'Beach Resort Paradise',
      description: 'Beachfront resort with stunning views',
      location: 'Beachfront',
      city: 'Miami',
      country: 'USA',
      amenities: JSON.stringify(['Beach Access', 'Pool', 'Spa', 'Water Sports']),
    },
  });

  console.log('✅ Created 2 hotels');

  // Create sample rooms
  const room1 = await prisma.room.create({
    data: {
      hotelId: hotel1.id,
      roomNumber: '101',
      type: 'single',
      price: 100,
      capacity: 1,
      description: 'Comfortable single room',
      amenities: JSON.stringify(['AC', 'TV', 'WiFi']),
    },
  });

  const room2 = await prisma.room.create({
    data: {
      hotelId: hotel1.id,
      roomNumber: '102',
      type: 'double',
      price: 150,
      capacity: 2,
      description: 'Spacious double room',
      amenities: JSON.stringify(['AC', 'TV', 'WiFi', 'Mini Bar']),
    },
  });

  const room3 = await prisma.room.create({
    data: {
      hotelId: hotel2.id,
      roomNumber: '201',
      type: 'suite',
      price: 250,
      capacity: 3,
      description: 'Luxury beachfront suite',
      amenities: JSON.stringify(['AC', 'TV', 'WiFi', 'Balcony', 'Jacuzzi']),
    },
  });

  console.log('✅ Created 3 rooms');

  // Create sample bookings
  const booking1 = await prisma.booking.create({
    data: {
      userId: user1.id,
      roomId: room1.id,
      checkInDate: new Date('2026-06-01'),
      checkOutDate: new Date('2026-06-05'),
      totalPrice: 400,
      status: 'confirmed',
      paymentStatus: 'paid',
    },
  });

  console.log('✅ Created 1 booking');

  // Create sample payment
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      amount: 400,
      method: 'credit_card',
      status: 'completed',
    },
  });

  console.log('✅ Created 1 payment');

  // Create sample reviews
  await prisma.review.create({
    data: {
      userId: user1.id,
      hotelId: hotel1.id,
      rating: 5,
      comment: 'Excellent service and beautiful hotel!',
    },
  });

  await prisma.review.create({
    data: {
      userId: user2.id,
      hotelId: hotel2.id,
      rating: 4,
      comment: 'Great location and friendly staff',
    },
  });

  console.log('✅ Created 2 reviews');

  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
