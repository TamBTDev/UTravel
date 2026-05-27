import prisma from "@/config/database";
import bcrypt from "bcrypt";
import {
  USER_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  USER_ROLES,
} from "../../../shared/constants/roles";

async function main() {
  console.log("Seeding database...");

  console.log("Clearing old data...");
  await prisma.walletTransaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.vendorProfile.deleteMany();

  // Create admin account
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@gmail.com" },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: "admin@gmail.com",
        password: await bcrypt.hash("123456", 10),
        firstName: "System",
        lastName: "Admin",
        phone: "0999999999",
        role: USER_ROLES.ADMIN,
        status: USER_STATUS.VERIFIED,
      },
    });
    console.log("Created admin user");
  }

  // Create users
  let testUser = await prisma.user.findUnique({
    where: { email: "test@gmail.com" },
  });
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: "test@gmail.com",
        password: await bcrypt.hash("123456", 10),
        firstName: "John",
        lastName: "Doe",
        phone: "0123456789",
        status: USER_STATUS.VERIFIED,
      },
    });
    console.log("Created test user 1 (John Doe)");
  }

  let janeUser = await prisma.user.findUnique({
    where: { email: "jane@example.com" },
  });
  if (!janeUser) {
    janeUser = await prisma.user.create({
      data: {
        email: "jane@example.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Jane",
        lastName: "Smith",
        phone: "0987654321",
        status: USER_STATUS.VERIFIED,
      },
    });
    console.log("Created test user 2 (Jane Smith)");
  }

  // Create Vendor
  let vendorUser = await prisma.user.findUnique({
    where: { email: "vendor@gmail.com" },
  });
  if (!vendorUser) {
    vendorUser = await prisma.user.create({
      data: {
        email: "vendor@gmail.com",
        password: await bcrypt.hash("123456", 10),
        firstName: "Nhà cung cấp",
        lastName: "UTravel",
        phone: "0888888888",
        role: USER_ROLES.VENDOR,
        status: USER_STATUS.VERIFIED,
      },
    });
  }

  const vendorProfile = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser.id,
      shopName: "UTravel Resort & Spa",
      description: "Hệ thống Resort và Khách sạn nghỉ dưỡng cao cấp trên toàn quốc.",
      businessLicense: "0102030405",
      bankName: "Techcombank",
      bankOwner: "NGUYEN VAN VENDOR",
      bankAccount: "1903123456789",
      status: "APPROVED",
      commissionRate: 10.0,
    },
  });

  const wallet = await prisma.wallet.create({
    data: {
      vendorId: vendorProfile.id,
      balance: 169450000.0, // calculated balance
    },
  });

  console.log("Created vendor, profile and wallet");

  console.log("Creating sample hotels and rooms...");
  const cities = ["Hà Nội", "Đà Nẵng", "Hồ Chí Minh", "Miami", "New York", "Đà Lạt"];
  const amenitiesList = [
    ["WiFi", "Pool", "Gym", "Restaurant"],
    ["Beach Access", "Pool", "Spa", "Water Sports"],
    ["WiFi", "Free Breakfast", "Airport Shuttle"],
    ["WiFi", "AC", "TV", "Mini Bar"],
    ["Pool", "Spa", "Gym", "Bar"],
  ];
  const images = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1170&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  ];

  const hotels = [];
  const rooms = [];

  for (let i = 1; i <= 15; i++) {
    const city = cities[i % cities.length];
    const hotel = await prisma.hotel.create({
      data: {
        name: `Khách sạn Grand ${city} ${i}`,
        description: `Tận hưởng kỳ nghỉ tuyệt vời tại Khách sạn Grand ${city} ${i} với đầy đủ tiện nghi và dịch vụ đẳng cấp.`,
        location: `Trung tâm ${city}`,
        city: city,
        country: ["Hà Nội", "Đà Nẵng", "Hồ Chí Minh", "Đà Lạt"].includes(city) ? "Vietnam" : "USA",
        rating: 3 + (i % 3),
        images: JSON.stringify([images[i % images.length]]),
        amenities: JSON.stringify(amenitiesList[i % amenitiesList.length]),
        vendorId: vendorProfile.id,
        approvalStatus: "APPROVED",
      },
    });
    hotels.push(hotel);

    const r1 = await prisma.room.create({
      data: {
        hotelId: hotel.id,
        roomNumber: "101",
        type: "single",
        price: 50 + i * 10,
        capacity: 1 + (i % 2),
        description: "Phòng tiêu chuẩn thoải mái.",
        amenities: JSON.stringify(["AC", "TV", "WiFi"]),
      },
    });
    rooms.push(r1);

    const r2 = await prisma.room.create({
      data: {
        hotelId: hotel.id,
        roomNumber: "102",
        type: "double",
        price: 100 + i * 15,
        capacity: 2 + (i % 3),
        description: "Phòng cao cấp rộng rãi có view tuyệt đẹp.",
        amenities: JSON.stringify(["AC", "TV", "WiFi", "Mini Bar", "View đẹp"]),
      },
    });
    rooms.push(r2);
  }
  console.log("Created 15 hotels and 30 rooms");

  // Rich sample bookings spanning different months of 2026
  const bookingTemplates = [
    { month: 0, price: 15000000, status: BOOKING_STATUS.COMPLETED, pStatus: PAYMENT_STATUS.COMPLETED, user: testUser, room: rooms[0] },
    { month: 1, price: 8000000, status: BOOKING_STATUS.COMPLETED, pStatus: PAYMENT_STATUS.COMPLETED, user: janeUser, room: rooms[1] },
    { month: 2, price: 12500000, status: BOOKING_STATUS.COMPLETED, pStatus: PAYMENT_STATUS.COMPLETED, user: testUser, room: rooms[2] },
    { month: 3, price: 9000000, status: BOOKING_STATUS.COMPLETED, pStatus: PAYMENT_STATUS.COMPLETED, user: janeUser, room: rooms[3] },
    { month: 4, price: 22000000, status: BOOKING_STATUS.COMPLETED, pStatus: PAYMENT_STATUS.COMPLETED, user: testUser, room: rooms[4] },
    { month: 5, price: 11000000, status: BOOKING_STATUS.CONFIRMED, pStatus: PAYMENT_STATUS.COMPLETED, user: janeUser, room: rooms[5] },
    { month: 6, price: 18500000, status: BOOKING_STATUS.CONFIRMED, pStatus: PAYMENT_STATUS.COMPLETED, user: testUser, room: rooms[6] },
    { month: 7, price: 7500000, status: BOOKING_STATUS.PENDING, pStatus: PAYMENT_STATUS.PENDING, user: janeUser, room: rooms[7] },
    { month: 8, price: 24000000, status: BOOKING_STATUS.CANCELLED, pStatus: PAYMENT_STATUS.REFUNDED, user: testUser, room: rooms[8] },
    { month: 9, price: 13000000, status: BOOKING_STATUS.CONFIRMED, pStatus: PAYMENT_STATUS.COMPLETED, user: janeUser, room: rooms[9] },
    { month: 10, price: 16000000, status: BOOKING_STATUS.CONFIRMED, pStatus: PAYMENT_STATUS.COMPLETED, user: testUser, room: rooms[10] },
    { month: 11, price: 21500000, status: BOOKING_STATUS.CONFIRMED, pStatus: PAYMENT_STATUS.COMPLETED, user: janeUser, room: rooms[11] },
  ];

  console.log("Creating bookings, payments and wallet transactions...");

  for (let idx = 0; idx < bookingTemplates.length; idx++) {
    const tmpl = bookingTemplates[idx];
    const checkIn = new Date(2026, tmpl.month, 10);
    const checkOut = new Date(2026, tmpl.month, 14);
    const createdAt = new Date(2026, tmpl.month, 1);

    const booking = await prisma.booking.create({
      data: {
        userId: tmpl.user.id,
        roomId: tmpl.room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice: tmpl.price,
        discountAmount: 0,
        finalPrice: tmpl.price,
        status: tmpl.status,
        paymentStatus: tmpl.pStatus,
        createdAt: createdAt,
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: tmpl.price,
        method: PAYMENT_METHOD.CREDIT_CARD,
        status: tmpl.pStatus,
        createdAt: createdAt,
      },
    });

    // Create wallet transactions for confirmed or completed bookings
    if (tmpl.status === BOOKING_STATUS.CONFIRMED || tmpl.status === BOOKING_STATUS.COMPLETED || tmpl.status === BOOKING_STATUS.CANCELLED) {
      // Booking Income
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          bookingId: booking.id,
          type: "BOOKING_INCOME",
          amount: tmpl.price,
          description: `Thu nhập đặt phòng #${booking.id}`,
          createdAt: createdAt,
        },
      });

      // Commission Fee
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          bookingId: booking.id,
          type: "COMMISSION_FEE",
          amount: tmpl.price * 0.1,
          description: `Phí hoa hồng 10% đặt phòng #${booking.id}`,
          createdAt: createdAt,
        },
      });

      // Refund if Cancelled
      if (tmpl.status === BOOKING_STATUS.CANCELLED) {
        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            bookingId: booking.id,
            type: "REFUND",
            amount: tmpl.price,
            description: `Hoàn tiền đặt phòng #${booking.id}`,
            createdAt: createdAt,
          },
        });
      }
    }
  }

  // Create a manual withdrawal transaction in June 2026
  await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: "WITHDRAWAL",
      amount: 10000000.0,
      description: "Yêu cầu rút tiền về tài khoản ngân hàng Techcombank",
      createdAt: new Date(2026, 5, 15),
    },
  });

  // Create sample reviews
  await prisma.review.create({
    data: {
      userId: testUser.id,
      hotelId: hotels[0].id,
      rating: 5,
      comment: "Dịch vụ tuyệt vời, phòng ốc sạch sẽ và nhân viên thân thiện!",
    },
  });

  await prisma.review.create({
    data: {
      userId: janeUser.id,
      hotelId: hotels[1].id,
      rating: 4,
      comment: "Vị trí đẹp, view biển xịn xò. Đồ ăn sáng ngon.",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
