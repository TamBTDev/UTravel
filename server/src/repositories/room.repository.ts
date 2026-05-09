import prisma from '@/config/database';
import { Room } from '@prisma/client';

export class RoomRepository {
  async findById(id: number) {
    return prisma.room.findUnique({
      where: { id },
      include: { hotel: true },
    });
  }

  async findByHotelId(hotelId: number, skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.room.findMany({
        where: { hotelId },
        skip,
        take,
        include: { hotel: true },
      }),
      prisma.room.count({
        where: { hotelId },
      }),
    ]);

    return { data, total };
  }

  async findAvailable(hotelId: number, checkIn: Date, checkOut: Date) {
    return prisma.room.findMany({
      where: {
        hotelId,
        isAvailable: true,
        bookings: {
          none: {
            OR: [
              {
                AND: [
                  { checkInDate: { lt: checkOut } },
                  { checkOutDate: { gt: checkIn } },
                ],
              },
            ],
          },
        },
      },
      include: { hotel: true },
    });
  }

  async create(data: {
    hotelId: number;
    roomNumber: string;
    type: string;
    price: number;
    capacity: number;
    description?: string;
    amenities?: string;
  }): Promise<Room> {
    return prisma.room.create({
      data,
    });
  }

  async update(
    id: number,
    data: {
      roomNumber?: string;
      type?: string;
      price?: number;
      capacity?: number;
      description?: string;
      amenities?: string;
      isAvailable?: boolean;
    }
  ): Promise<Room> {
    return prisma.room.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Room> {
    return prisma.room.delete({
      where: { id },
    });
  }
}

export const roomRepository = new RoomRepository();
