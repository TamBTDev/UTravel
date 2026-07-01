import prisma from "@/config/database";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv"; // 1. Import dotenv

dotenv.config(); // 2. Kích hoạt dotenv để nạp file .env vào process.env
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
  await prisma.withdrawRequest.deleteMany();
  await prisma.vendorProfile.deleteMany();

  // Create admin account
  const adminPasswordHash = await bcrypt.hash("123456", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {
      password: adminPasswordHash,
      role: USER_ROLES.ADMIN,
      firstName: "System",
      lastName: "Admin",
      phone: "0999999999",
      status: USER_STATUS.VERIFIED,
    },
    create: {
      email: "admin@gmail.com",
      password: adminPasswordHash,
      firstName: "System",
      lastName: "Admin",
      phone: "0999999999",
      role: USER_ROLES.ADMIN,
      status: USER_STATUS.VERIFIED,
    },
  });
  console.log("Upserted admin user");

  // Create users
  const testUserPasswordHash = await bcrypt.hash("123456", 10);
  const testUser = await prisma.user.upsert({
    where: { email: "test@gmail.com" },
    update: {
      password: testUserPasswordHash,
      role: USER_ROLES.USER,
      firstName: "John",
      lastName: "Doe",
      phone: "0123456789",
      status: USER_STATUS.VERIFIED,
    },
    create: {
      email: "test@gmail.com",
      password: testUserPasswordHash,
      firstName: "John",
      lastName: "Doe",
      phone: "0123456789",
      role: USER_ROLES.USER,
      status: USER_STATUS.VERIFIED,
    },
  });
  console.log("Upserted test user 1 (John Doe)");

  const janeUserPasswordHash = await bcrypt.hash("123456", 10);
  const janeUser = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {
      password: janeUserPasswordHash,
      role: USER_ROLES.MANAGER,
      firstName: "Jane",
      lastName: "Smith",
      phone: "0987654321",
      status: USER_STATUS.VERIFIED,
    },
    create: {
      email: "jane@example.com",
      password: janeUserPasswordHash,
      firstName: "Jane",
      lastName: "Smith",
      phone: "0987654321",
      role: USER_ROLES.MANAGER,
      status: USER_STATUS.VERIFIED,
    },
  });
  console.log("Upserted test user 2 (Jane Smith)");

  // Create Vendor
  const vendorUserPasswordHash = await bcrypt.hash("123456", 10);
  const vendorUser = await prisma.user.upsert({
    where: { email: "vendor@gmail.com" },
    update: {
      password: vendorUserPasswordHash,
      role: USER_ROLES.VENDOR,
      firstName: "Nhà cung cấp",
      lastName: "UTravel",
      phone: "0888888888",
      status: USER_STATUS.VERIFIED,
    },
    create: {
      email: "vendor@gmail.com",
      password: vendorUserPasswordHash,
      firstName: "Nhà cung cấp",
      lastName: "UTravel",
      phone: "0888888888",
      role: USER_ROLES.VENDOR,
      status: USER_STATUS.VERIFIED,
    },
  });
  console.log("Upserted vendor user");

  const vendorProfile = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser.id,
      shopName: "UTravel Resort & Spa",
      description:
        "Hệ thống Resort và Khách sạn nghỉ dưỡng cao cấp trên toàn quốc.",
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

  // Create Pending Withdraw Request
  await prisma.withdrawRequest.create({
    data: {
      vendorId: vendorProfile.id,
      walletId: wallet.id,
      amount: 5000000,
      bankName: "Techcombank",
      bankAccount: "1903123456789",
      bankOwner: "NGUYEN VAN VENDOR",
      status: "PENDING",
      note: "Rút tiền hoa hồng tháng này",
    },
  });

  // Create a Pending Vendor
  const pendingVendorUserPasswordHash = await bcrypt.hash("123456", 10);
  const pendingVendorUser = await prisma.user.upsert({
    where: { email: "pendingvendor@gmail.com" },
    update: {
      password: pendingVendorUserPasswordHash,
      role: USER_ROLES.VENDOR,
      firstName: "Đối tác",
      lastName: "Chờ duyệt",
      phone: "0777777777",
      status: USER_STATUS.VERIFIED,
    },
    create: {
      email: "pendingvendor@gmail.com",
      password: pendingVendorUserPasswordHash,
      firstName: "Đối tác",
      lastName: "Chờ duyệt",
      phone: "0777777777",
      role: USER_ROLES.VENDOR,
      status: USER_STATUS.VERIFIED,
    },
  });
  const pendingVendorProfile = await prisma.vendorProfile.create({
    data: {
      userId: pendingVendorUser.id,
      shopName: "Khách sạn Chờ Duyệt",
      description: "Khách sạn này mới đăng ký, đang chờ Admin duyệt",
      businessLicense: "099999999",
      bankName: "Vietcombank",
      bankOwner: "DOI TAC CHO DUYET",
      bankAccount: "0123456789",
      status: "PENDING",
      commissionRate: 10.0,
    },
  });

  // Create Foreign Vendor
  const foreignVendorUserPasswordHash = await bcrypt.hash("123456", 10);
  const foreignVendorUser = await prisma.user.upsert({
    where: { email: "foreign@gmail.com" },
    update: {
      password: foreignVendorUserPasswordHash,
      role: USER_ROLES.VENDOR,
      firstName: "Quốc tế",
      lastName: "UTravel",
      phone: "0333333333",
      status: USER_STATUS.VERIFIED,
    },
    create: {
      email: "foreign@gmail.com",
      password: foreignVendorUserPasswordHash,
      firstName: "Quốc tế",
      lastName: "UTravel",
      phone: "0333333333",
      role: USER_ROLES.VENDOR,
      status: USER_STATUS.VERIFIED,
    },
  });
  const foreignVendorProfile = await prisma.vendorProfile.create({
    data: {
      userId: foreignVendorUser.id,
      shopName: "UTravel International Hotels",
      description: "Chuỗi khách sạn và khu nghỉ dưỡng quốc tế hàng đầu.",
      businessLicense: "INTERNATIONAL123",
      bankName: "HSBC",
      bankOwner: "UTRAVEL INTL",
      bankAccount: "9999999999",
      status: "APPROVED",
      commissionRate: 15.0,
    },
  });
  const foreignWallet = await prisma.wallet.create({
    data: {
      vendorId: foreignVendorProfile.id,
      balance: 50000000.0,
    },
  });

  console.log("Created vendor, pending vendor, foreign vendor, profiles, and wallets");

  console.log("Creating sample hotels and rooms...");
  const cities = [
    "Hà Nội",
    "Đà Nẵng",
    "Hồ Chí Minh",
    "Miami",
    "New York",
    "Đà Lạt",
  ];
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

    // Tạo địa chỉ thực tế hơn
    const vnStreets = [
      "Nguyễn Văn Linh",
      "Lê Duẩn",
      "Trần Hưng Đạo",
      "Nguyễn Đình Chiểu",
      "Hoàng Sa",
      "Võ Nguyên Giáp",
      "Nguyễn Trãi",
    ];
    const usStreets = [
      "5th Avenue",
      "Ocean Drive",
      "Broadway",
      "Market Street",
      "Washington Blvd",
    ];
    const isVn = ["Hà Nội", "Đà Nẵng", "Hồ Chí Minh", "Đà Lạt"].includes(city);
    const streetName = isVn
      ? vnStreets[i % vnStreets.length]
      : usStreets[i % usStreets.length];
    const buildingNo = 10 + ((i * 17) % 200);
    const wardName = isVn
      ? i % 2 === 0
        ? "Phường 1"
        : "Phường Bến Nghé"
      : "Downtown";
    const detailLocation = isVn
      ? `Số ${buildingNo} ${streetName}, ${wardName}`
      : `${buildingNo} ${streetName}, ${wardName}`;

    const isForeign = ["Miami", "New York"].includes(city);
    const assignedVendorId = isForeign ? foreignVendorProfile.id : vendorProfile.id;

    const hotel = await prisma.hotel.create({
      data: {
        name: `Khách sạn Grand ${city} ${i}`,
        description: `Tận hưởng kỳ nghỉ tuyệt vời tại Khách sạn Grand ${city} ${i} với đầy đủ tiện nghi và dịch vụ đẳng cấp.`,
        location: detailLocation,
        city: city,
        country: isVn ? "Vietnam" : "USA",
        rating: 3 + (i % 3),
        images: JSON.stringify([images[i % images.length]]),
        amenities: JSON.stringify(amenitiesList[i % amenitiesList.length]),
        vendorId: assignedVendorId,
        approvalStatus: i === 1 ? "PENDING" : "APPROVED",
        isActive: true,
      },
    });
    hotels.push(hotel);

    const r1 = await prisma.room.create({
      data: {
        hotelId: hotel.id,
        roomNumber: "101",
        type: "single",
        price: 500000 + i * 100000,
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
        price: 1000000 + i * 150000,
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
    {
      month: 0,
      price: 15000000,
      status: BOOKING_STATUS.COMPLETED,
      pStatus: PAYMENT_STATUS.COMPLETED,
      user: testUser,
      room: rooms[0],
    },
    {
      month: 1,
      price: 8000000,
      status: BOOKING_STATUS.COMPLETED,
      pStatus: PAYMENT_STATUS.COMPLETED,
      user: janeUser,
      room: rooms[1],
    },
    {
      month: 2,
      price: 12500000,
      status: BOOKING_STATUS.COMPLETED,
      pStatus: PAYMENT_STATUS.COMPLETED,
      user: testUser,
      room: rooms[2],
    },
    {
      month: 3,
      price: 9000000,
      status: BOOKING_STATUS.COMPLETED,
      pStatus: PAYMENT_STATUS.COMPLETED,
      user: janeUser,
      room: rooms[3],
    },
    {
      month: 4,
      price: 22000000,
      status: BOOKING_STATUS.COMPLETED,
      pStatus: PAYMENT_STATUS.COMPLETED,
      user: testUser,
      room: rooms[4],
    },
    {
      month: 5,
      price: 11000000,
      status: BOOKING_STATUS.CONFIRMED,
      pStatus: PAYMENT_STATUS.COMPLETED,
      user: janeUser,
      room: rooms[5],
    },
    {
      month: 6,
      price: 18500000,
      status: BOOKING_STATUS.CONFIRMED,
      pStatus: PAYMENT_STATUS.COMPLETED,
      user: testUser,
      room: rooms[6],
    },
    {
      month: 7,
      price: 7500000,
      status: BOOKING_STATUS.PENDING,
      pStatus: PAYMENT_STATUS.PENDING,
      user: janeUser,
      room: rooms[7],
    },
    {
      month: 8,
      price: 24000000,
      status: BOOKING_STATUS.CANCELLED,
      pStatus: PAYMENT_STATUS.REFUNDED,
      user: testUser,
      room: rooms[8],
    },
    {
      month: 9,
      price: 13000000,
      status: BOOKING_STATUS.CONFIRMED,
      pStatus: PAYMENT_STATUS.COMPLETED,
      user: janeUser,
      room: rooms[9],
    },
    {
      month: 10,
      price: 16000000,
      status: BOOKING_STATUS.CONFIRMED,
      pStatus: PAYMENT_STATUS.COMPLETED,
      user: testUser,
      room: rooms[10],
    },
    {
      month: 11,
      price: 21500000,
      status: BOOKING_STATUS.CONFIRMED,
      pStatus: PAYMENT_STATUS.COMPLETED,
      user: janeUser,
      room: rooms[11],
    },
    {
      month: 6, // Not used strictly because we override dates below
      price: 15000000,
      status: BOOKING_STATUS.CONFIRMED,
      pStatus: PAYMENT_STATUS.COMPLETED,
      user: testUser,
      room: rooms[26], // Khách sạn Grand Hồ Chí Minh 14
      checkIn: new Date(2026, 5, 30), // June 30th
      checkOut: new Date(2026, 6, 5), // July 5th (Covers July 2nd)
    },
  ];

  console.log("Creating bookings, payments and wallet transactions...");

  for (let idx = 0; idx < bookingTemplates.length; idx++) {
    const tmpl = bookingTemplates[idx] as any;
    const checkIn = tmpl.checkIn || new Date(2026, tmpl.month, 10);
    const checkOut = tmpl.checkOut || new Date(2026, tmpl.month, 14);
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
    if (
      tmpl.status === BOOKING_STATUS.CONFIRMED ||
      tmpl.status === BOOKING_STATUS.COMPLETED ||
      tmpl.status === BOOKING_STATUS.CANCELLED
    ) {
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

  await prisma.review.create({
    data: {
      userId: testUser.id,
      hotelId: hotels[2].id,
      rating: 5,
      comment: "Phòng sạch sẽ, giường ngủ rất êm. Nhất định sẽ quay lại!",
      vendorReply:
        "Cảm ơn quý khách đã tin tưởng và lựa chọn khách sạn của chúng tôi! Hẹn gặp lại bạn trong chuyến đi tiếp theo.",
      vendorReplyAt: new Date(2026, 4, 12),
    },
  });

  await prisma.review.create({
    data: {
      userId: janeUser.id,
      hotelId: hotels[0].id,
      rating: 3,
      comment: "Phòng hơi nhỏ so với ảnh chụp. WiFi buổi tối hơi chập chờn.",
      vendorReply:
        "Chào bạn, chúng tôi rất tiếc vì trải nghiệm WiFi chưa tốt. Khách sạn đã nâng cấp băng thông hệ thống và hy vọng được phục vụ bạn tốt hơn lần sau.",
      vendorReplyAt: new Date(2026, 4, 15),
    },
  });

  await prisma.review.create({
    data: {
      userId: testUser.id,
      hotelId: hotels[1].id,
      rating: 2,
      comment:
        "Nhà vệ sinh có mùi nhẹ, phục vụ phòng dọn dẹp hơi trễ. Cần cải thiện chất lượng phục vụ.",
    },
  });

  await prisma.review.create({
    data: {
      userId: janeUser.id,
      hotelId: hotels[3].id,
      rating: 4,
      comment: "Không gian yên tĩnh phù hợp nghỉ dưỡng gia đình. Hồ bơi sạch.",
    },
  });

  await prisma.review.create({
    data: {
      userId: testUser.id,
      hotelId: hotels[4].id,
      rating: 5,
      comment: "Tuyệt vời! Giá cả hợp lý, nhân viên phục vụ chu đáo tận tình.",
      vendorReply:
        "Cảm ơn bạn rất nhiều vì phản hồi tích cực! Chúc bạn và gia đình luôn nhiều niềm vui.",
      vendorReplyAt: new Date(2026, 4, 20),
    },
  });

  await prisma.review.create({
    data: {
      userId: janeUser.id,
      hotelId: hotels[2].id,
      rating: 1,
      comment:
        "Phòng đặt trước bị trùng, phải đợi giải quyết rất lâu. Rất không hài lòng.",
    },
  });

  await prisma.review.create({
    data: {
      userId: janeUser.id,
      hotelId: hotels[0].id,
      rating: 5,
      comment: "Rất hài lòng với chuyến đi này. Đồ ăn buffet ngon miệng.",
    },
  });

  await prisma.review.create({
    data: {
      userId: testUser.id,
      hotelId: hotels[1].id,
      rating: 3,
      comment: "Khách sạn khá cũ, tuy nhiên vị trí thuận lợi gần trung tâm.",
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
