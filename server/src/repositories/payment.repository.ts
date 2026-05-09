import prisma from '@/config/database';
import { Booking } from '@prisma/client';

export class BookingRepository {
  async findById(id: number) {
    return prisma.booking.findUnique({
      where: { id },
      include: { user: true, room: { include: { hotel: true } }, payment: true },
    });
  }

  async findByUserId(userId: number, skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId },
        skip,
        take,
        include: { room: { include: { hotel: true } }, payment: true },
      }),
      prisma.booking.count({ where: { userId } }),
    ]);

    return { data, total };
  }

  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        skip,
        take,
        include: { user: true, room: { include: { hotel: true } }, payment: true },
      }),
      prisma.booking.count(),
    ]);

    return { data, total };
  }

  async create(data: {
    userId: number;
    roomId: number;
    checkInDate: Date;
    checkOutDate: Date;
    totalPrice: number;
  }): Promise<Booking> {
    return prisma.booking.create({
      data: {
        ...data,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
    });
  }

  async update(
    id: number,
    data: {
      status?: string;
      paymentStatus?: string;
    }
  ): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Booking> {
    return prisma.booking.delete({
      where: { id },
    });
  }

  async findByStatus(status: string, skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where: { status },
        skip,
        take,
        include: { user: true, room: { include: { hotel: true } } },
      }),
      prisma.booking.count({ where: { status } }),
    ]);

    return { data, total };
  }
}

export const bookingRepository = new BookingRepository();
