import prisma from '@/config/database';
import { User } from '@prisma/client';

export class UserRepository {
  /**
   * Tìm user theo ID (không lấy password)
   */
  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Tìm user theo Email (có password để check login)
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return { data, total };
  }

  async create(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Cập nhật thông tin user
   */
  async update(
    id: number,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      avatar?: string;
      status?: string;
    }
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        avatar: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Cập nhật mật khẩu user
   */
  async updatePassword(id: number, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: { id: true, email: true },
    });
  }

  async delete(id: number) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export const userRepository = new UserRepository();
