import * as userRepository from "./user.repository";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProfile = async (userId: number) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new Error("Người dùng không tìm thấy");
  return user;
};

export const updateProfile = async (
  userId: number,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    avatar?: string;
  },
) => {
  const existing = await userRepository.findById(userId);
  if (!existing) throw new Error("Người dùng không tìm thấy");

  return await userRepository.update(userId, data);
};

export const toggleFavorite = async (userId: number, hotelId: number) => {
  const existing = await prisma.favoriteHotel.findUnique({
    where: { userId_hotelId: { userId, hotelId } },
  });

  if (existing) {
    await prisma.favoriteHotel.delete({ where: { id: existing.id } });
    return { favorited: false };
  } else {
    await prisma.favoriteHotel.create({ data: { userId, hotelId } });
    return { favorited: true };
  }
};

export const getFavorites = async (userId: number) => {
  return await prisma.favoriteHotel.findMany({
    where: { userId },
    include: {
      hotel: true,
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const addViewed = async (userId: number, hotelId: number) => {
  await prisma.viewedHotel.upsert({
    where: { userId_hotelId: { userId, hotelId } },
    update: { viewedAt: new Date() },
    create: { userId, hotelId },
  });

  // Tăng view count của hotel
  await prisma.hotel.update({
    where: { id: hotelId },
    data: { viewCount: { increment: 1 } },
  });

  return { success: true };
};

export const getViewed = async (userId: number) => {
  return await prisma.viewedHotel.findMany({
    where: { userId },
    include: {
      hotel: true,
    },
    orderBy: { viewedAt: 'desc' },
    take: 20
  });
};
