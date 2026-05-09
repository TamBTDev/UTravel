import prisma from '@/config/database';

/**
 * UserOtp Repository
 * Quản lý OTP cho đăng ký, quên mật khẩu, v.v.
 */

export class UserOtpRepository {
  /**
   * Tạo OTP mới
   */
  async create(data: {
    userId: number;
    otpCode: string;
    type: string; // "REGISTER", "FORGOT_PASSWORD"
    expiresAt: Date;
  }) {
    return prisma.userOtp.create({
      data,
    });
  }

  /**
   * Tìm OTP chưa sử dụng theo userId, type, và còn hạn
   */
  async findValidOtp(userId: number, type: string) {
    return prisma.userOtp.findFirst({
      where: {
        userId,
        type,
        isUsed: false,
        expiresAt: {
          gt: new Date(), // Chỉ lấy OTP còn hạn
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Tìm OTP theo code và type
   */
  async findByCode(otpCode: string, type: string) {
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
  }

  /**
   * Đánh dấu OTP đã sử dụng
   */
  async markAsUsed(otpId: number) {
    return prisma.userOtp.update({
      where: { id: otpId },
      data: { isUsed: true },
    });
  }

  /**
   * Xóa tất cả OTP hết hạn của user
   */
  async deleteExpiredOtps(userId: number) {
    return prisma.userOtp.deleteMany({
      where: {
        userId,
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Lấy OTP gần nhất của user (cho phép tái gửi)
   */
  async getLastOtp(userId: number, type: string) {
    return prisma.userOtp.findFirst({
      where: {
        userId,
        type,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const userOtpRepository = new UserOtpRepository();
