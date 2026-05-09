import { reviewRepository } from '@/repositories/review.repository';
import { hotelRepository } from '@/repositories/hotel.repository';
import { userRepository } from '@/repositories/user.repository';

export class ReviewService {
  async createReview(userId: number, hotelId: number, rating: number, comment?: string) {
    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify hotel exists
    const hotel = await hotelRepository.findById(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return reviewRepository.create({
      userId,
      hotelId,
      rating,
      comment,
    });
  }

  async getHotelReviews(hotelId: number, page: number = 1, limit: number = 10) {
    // Verify hotel exists
    const hotel = await hotelRepository.findById(hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const skip = (page - 1) * limit;
    const result = await reviewRepository.findByHotelId(hotelId, skip, limit);

    return {
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async updateReview(id: number, rating?: number, comment?: string) {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new Error('Review not found');
    }

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    return reviewRepository.update(id, { rating, comment });
  }

  async deleteReview(id: number) {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new Error('Review not found');
    }

    return reviewRepository.delete(id);
  }
}

export const reviewService = new ReviewService();
