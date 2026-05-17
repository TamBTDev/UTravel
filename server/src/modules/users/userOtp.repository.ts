import prisma from "@/config/database";

export const create = async (data: {
  userId: number;
  otpCode: string;
  type: string; // "REGISTER", "FORGOT_PASSWORD"
  expiresAt: Date;
}) => {
  try {
    console.log("[OTP_REPO] Creating OTP for user:", {
      userId: data.userId,
      type: data.type,
      otpCode: data.otpCode,
      expiresAt: data.expiresAt,
    });
    
    const otp = await prisma.userOtp.create({
      data,
    });
    
    console.log("[OTP_REPO] OTP created successfully with ID:", otp.id);
    return otp;
  } catch (error: any) {
    console.error("[OTP_REPO] Error creating OTP:", {
      userId: data.userId,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    throw error;
  }
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
  try {
    console.log("[OTP_REPO] Looking up OTP by code:", {
      type,
      otpCode: otpCode,
      currentTime: new Date(),
    });
    
    const otp = await prisma.userOtp.findFirst({
      where: {
        otpCode,
        type,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    
    console.log("[OTP_REPO] OTP lookup result:", otp ? "FOUND (UserID: " + otp.userId + ")" : "NOT FOUND");
    return otp;
  } catch (error: any) {
    console.error("[OTP_REPO] Error finding OTP by code:", {
      type,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
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
