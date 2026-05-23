import prisma from "@/config/database";
import bcrypt from "bcrypt";
import { USER_STATUS, BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from "../../../shared/constants/roles";

async function main() {
  console.log("Seeding database...");

  console.log("Clearing hotel data...");
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();

  const existingUser1 = await prisma.user.findUnique({
    where: { email: "test@gmail.com" },
  });

  if (!existingUser1) {
    await prisma.user.create({
      data: {
        email: "test@gmail.com",
        password: await bcrypt.hash("123456", 10),
        firstName: "John",
        lastName: "Doe",
        phone: "0123456789",
        status: USER_STATUS.VERIFIED,
      },
    });
    console.log("Created test user 1");
  }

  const existingUser2 = await prisma.user.findUnique({
    where: { email: "jane@example.com" },
  });

  if (!existingUser2) {
    await prisma.user.create({
      data: {
        email: "jane@example.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Jane",
        lastName: "Smith",
        phone: "0987654321",
        status: USER_STATUS.VERIFIED,
      },
    });
    console.log("Created test user 2");
  }

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
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  ];

  const hotels = [];
  for (let i = 1; i <= 15; i++) {
    const city = cities[i % cities.length];
    const hotel = await prisma.hotel.create({
      data: {
        name: `Khách sạn Grand ${city} ${i}`,
        description: `Tận hưởng kỳ nghỉ tuyệt vời tại Khách sạn Grand ${city} ${i} với đầy đủ tiện nghi và dịch vụ đẳng cấp. Nằm ở vị trí đắc địa giúp bạn dễ dàng di chuyển.`,
        location: `Trung tâm ${city}`,
        city: city,
        country: ["Hà Nội", "Đà Nẵng", "Hồ Chí Minh", "Đà Lạt"].includes(city)
          ? "Vietnam"
          : "USA",
        rating: 3 + (i % 3),
        images: JSON.stringify([images[i % images.length]]),
        amenities: JSON.stringify(amenitiesList[i % amenitiesList.length]),
      },
    });
    hotels.push(hotel);

    await prisma.room.create({
      data: {
        hotelId: hotel.id,
        roomNumber: "101",
        type: "single",
        price: 50 + i * 10,
        capacity: 1 + (i % 2),
        description: "Phòng tiêu chuẩn thoải mái, phù hợp cho cá nhân hoặc cặp đôi.",
        amenities: JSON.stringify(["AC", "TV", "WiFi"]),
      },
    });

    await prisma.room.create({
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
  }
  console.log("Created 15 hotels and 30 rooms");

  const firstRoom = await prisma.room.findFirst({
    where: { hotelId: hotels[0].id },
  });

  const sampleUser = await prisma.user.findFirst({
    where: { email: "test@gmail.com" },
  });

  if (sampleUser && firstRoom) {
    const existingBooking = await prisma.booking.findFirst({
      where: { userId: sampleUser.id },
    });

    if (!existingBooking) {
      const booking1 = await prisma.booking.create({
        data: {
          userId: sampleUser.id,
          roomId: firstRoom.id,
          checkInDate: new Date("2026-06-01"),
          checkOutDate: new Date("2026-06-05"),
          totalPrice: 400,
          discountAmount: 0,
          finalPrice: 400,
          status: BOOKING_STATUS.CONFIRMED,
          paymentStatus: PAYMENT_STATUS.COMPLETED,
        },
      });

      console.log("Created 1 booking");

      await prisma.payment.create({
        data: {
          bookingId: booking1.id,
          amount: 400,
          method: PAYMENT_METHOD.CREDIT_CARD,
          status: PAYMENT_STATUS.COMPLETED,
        },
      });

      console.log("Created 1 booking and 1 payment");
    }
  }

  const testUser = await prisma.user.findFirst({
    where: { email: "test@gmail.com" },
  });

  const janeUser = await prisma.user.findFirst({
    where: { email: "jane@example.com" },
  });

  if (testUser && hotels.length > 0) {
    const existingReview = await prisma.review.findFirst({
      where: { userId: testUser.id },
    });

    if (!existingReview) {
      await prisma.review.create({
        data: {
          userId: testUser.id,
          hotelId: hotels[0].id,
          rating: 5,
          comment: "Excellent service and beautiful hotel!",
        },
      });
    }
  }

  if (janeUser && hotels.length > 1) {
    const existingReview = await prisma.review.findFirst({
      where: { userId: janeUser.id, hotelId: hotels[1].id },
    });

    if (!existingReview) {
      await prisma.review.create({
        data: {
          userId: janeUser.id,
          hotelId: hotels[1].id,
          rating: 4,
          comment: "Great location and friendly staff",
        },
      });
    }
  }

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
