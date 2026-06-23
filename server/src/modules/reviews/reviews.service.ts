import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReviewService {
  async createReview(userId: number, data: { 
    hotelId: number; 
    bookingId: number; 
    rating: number; 
    comment?: string;
    cleanlinessRating?: number;
    serviceRating?: number;
    locationRating?: number;
    valueRating?: number;
    highlights?: string[];
    images?: string[];
  }) {
    // 1. Kiểm tra booking có tồn tại, có thuộc về user này, có trạng thái COMPLETED và chưa được đánh giá
    const booking = await prisma.booking.findFirst({
      where: {
        id: data.bookingId,
        userId,
        roomId: {
          in: (await prisma.room.findMany({ where: { hotelId: data.hotelId }, select: { id: true } })).map(r => r.id),
        },
      },
    });

    if (!booking) {
      throw new Error('Không tìm thấy đơn hàng hợp lệ để đánh giá');
    }
    
    if (booking.status !== 'COMPLETED') {
        throw new Error('Chỉ có thể đánh giá sau khi hoàn thành kỳ nghỉ');
    }

    const existingReview = await prisma.review.findUnique({
      where: { bookingId: data.bookingId },
    });

    if (existingReview) {
      throw new Error('Đơn hàng này đã được đánh giá');
    }

    // 2. Tạo đánh giá và cộng điểm thưởng bằng 1 transaction
    const REWARD_POINTS = 50; // Thưởng 50 điểm

    const result = await prisma.$transaction(async (tx) => {
      // Tạo review
      const review = await tx.review.create({
        data: {
          userId,
          hotelId: data.hotelId,
          bookingId: data.bookingId,
          rating: data.rating,
          comment: data.comment,
          cleanlinessRating: data.cleanlinessRating,
          serviceRating: data.serviceRating,
          locationRating: data.locationRating,
          valueRating: data.valueRating,
          highlights: data.highlights ? data.highlights : undefined,
          images: data.images ? data.images : undefined,
        },
      });

      // Cộng điểm cho user
      await tx.user.update({
        where: { id: userId },
        data: {
          rewardPoints: { increment: REWARD_POINTS },
        },
      });

      // Cập nhật lại rating trung bình cho hotel
      const aggregations = await tx.review.aggregate({
        where: { hotelId: data.hotelId },
        _avg: { rating: true },
      });

      if (aggregations._avg.rating) {
        await tx.hotel.update({
          where: { id: data.hotelId },
          data: { rating: aggregations._avg.rating },
        });
      }

      return { review, rewardPoints: REWARD_POINTS };
    });

    return result;
  }

  async getHotelReviews(hotelId: number, skip: number, take: number) {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { hotelId },
        skip,
        take,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { hotelId } }),
    ]);

    return { reviews, total };
  }
}

export const reviewService = new ReviewService();
