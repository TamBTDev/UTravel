import prisma from '@/config/database';
import { Review } from '@prisma/client';

// Export all repositories
export { userRepository } from './user.repository';
export { userOtpRepository } from './userOtp.repository';

export class ReviewRepository {
  async findById(id: number) {
    return prisma.review.findUnique({
      where: { id },
      include: { user: true, hotel: true },
    });
  }

  async findByHotelId(hotelId: number, skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where: { hotelId },
        skip,
        take,
        include: { user: true },
      }),
      prisma.review.count({ where: { hotelId } }),
    ]);

    return { data, total };
  }

  async create(data: {
    userId: number;
    hotelId: number;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    return prisma.review.create({
      data,
    });
  }

  async update(
    id: number,
    data: {
      rating?: number;
      comment?: string;
    }
  ): Promise<Review> {
    return prisma.review.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Review> {
    return prisma.review.delete({
      where: { id },
    });
  }

  async getAverageRating(hotelId: number) {
    const result = await prisma.review.aggregate({
      where: { hotelId },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating || 0;
  }
}

export const reviewRepository = new ReviewRepository();
