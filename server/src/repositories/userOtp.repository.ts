import prisma from "@/config/database";

export const create = async (data: {
  userId: number;
  otpCode: string;
  type: string; // "REGISTER", "FORGOT_PASSWORD"
  expiresAt: Date;
}) => {
  return prisma.userOtp.create({
    data,
  });
};

export const findValidOtp = async (userId: number, type: string) => {
  return prisma.userOtp.findFirst({
    where: {
      userId,
      type,
      isUsed: false,
      expiresAt: {
        gt: new Date(), // Chỉ lấy OTP còn hạn
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findByCode = async (otpCode: string, type: string) => {
  return prisma.userOtp.findFirst({
    where: {
      otpCode,
      type,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
};

export const markAsUsed = async (otpId: number) => {
  return prisma.userOtp.update({
    where: { id: otpId },
    data: { isUsed: true },
  });
};

export const deleteExpiredOtps = async (userId: number) => {
  return prisma.userOtp.deleteMany({
    where: {
      userId,
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};

export const getLastOtp = async (userId: number, type: string) => {
  return prisma.userOtp.findFirst({
    where: {
      userId,
      type,
    },
    orderBy: { createdAt: "desc" },
  });
};
