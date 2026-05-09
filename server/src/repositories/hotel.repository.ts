import prisma from '@/config/database';
import { Hotel } from '@prisma/client';

export class HotelRepository {
  async findById(id: number) {
    return prisma.hotel.findUnique({
      where: { id },
      include: { rooms: true, reviews: true },
    });
  }

  async findAll(skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.hotel.findMany({
        skip,
        take,
        include: { rooms: true, reviews: true },
      }),
      prisma.hotel.count(),
    ]);

    return { data, total };
  }

  async findByLocation(location: string, skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.hotel.findMany({
        where: {
          location: {
            contains: location,
          },
        },
        skip,
        take,
        include: { rooms: true },
      }),
      prisma.hotel.count({
        where: {
          location: {
            contains: location,
          },
        },
      }),
    ]);

    return { data, total };
  }

  async create(data: {
    name: string;
    description?: string;
    location: string;
    city: string;
    country: string;
    amenities?: string;
  }): Promise<Hotel> {
    return prisma.hotel.create({
      data,
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      location?: string;
      city?: string;
      country?: string;
      amenities?: string;
    }
  ): Promise<Hotel> {
    return prisma.hotel.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Hotel> {
    return prisma.hotel.delete({
      where: { id },
    });
  }
}

export const hotelRepository = new HotelRepository();
