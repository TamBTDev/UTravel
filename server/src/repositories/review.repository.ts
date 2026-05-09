import prisma from '@/config/database';
import { Payment } from '@prisma/client';

export class PaymentRepository {
  async findById(id: number) {
    return prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });
  }

  async findByBookingId(bookingId: number) {
    return prisma.payment.findUnique({
      where: { bookingId },
      include: { booking: true },
    });
  }

  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take,
        include: { booking: true },
      }),
      prisma.payment.count(),
    ]);

    return { data, total };
  }

  async create(data: {
    bookingId: number;
    amount: number;
    method: string;
  }): Promise<Payment> {
    return prisma.payment.create({
      data: {
        ...data,
        status: 'pending',
      },
    });
  }

  async update(
    id: number,
    data: {
      status?: string;
      method?: string;
    }
  ): Promise<Payment> {
    return prisma.payment.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Payment> {
    return prisma.payment.delete({
      where: { id },
    });
  }
}

export const paymentRepository = new PaymentRepository();
