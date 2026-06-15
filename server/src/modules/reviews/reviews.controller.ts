import { Request, Response, NextFunction } from 'express';
import { reviewService } from './reviews.service';
import { createReviewSchema } from '../../../../shared/schemas/review.schema';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const validatedData = createReviewSchema.parse(req.body);

    const result = await reviewService.createReview(userId, validatedData);

    res.status(201).json({
      success: true,
      message: `Đánh giá thành công. Bạn được nhận +${result.rewardPoints} điểm thưởng!`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getHotelReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotelId = Number(req.params.hotelId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const data = await reviewService.getHotelReviews(hotelId, skip, limit);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
