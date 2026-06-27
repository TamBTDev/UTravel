import { Request, Response, NextFunction } from 'express';
import { reviewService } from './reviews.service';
import { createReviewSchema } from '../../../../shared/schemas/review.schema';
import { sendReviewNotification } from '../../services/email.service';
import { getIO } from '../../services/socket.service';
import prisma from '../../config/database';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const validatedData = createReviewSchema.parse(req.body);

    const result = await reviewService.createReview(userId, validatedData);

    // Send real-time email to Vendor
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { id: validatedData.hotelId },
        include: { vendor: { include: { user: true } } }
      });
      if (hotel?.vendor?.user?.email) {
        sendReviewNotification(
          hotel.vendor.user.email,
          hotel.name,
          req.user!.firstName || 'Khách hàng',
          validatedData.rating,
          validatedData.comment || ''
        ).catch(err => console.error("Error sending review email:", err));
        
        // Emit Socket Event
        try {
          const io = getIO();
          io.to(`vendor_${hotel.vendor.id}`).emit("new_review", {
            hotelName: hotel.name,
            reviewerName: req.user!.firstName || 'Khách hàng',
            rating: validatedData.rating,
            comment: validatedData.comment,
            createdAt: new Date()
          });
        } catch (err) {
          console.error("Socket emit error:", err);
        }
      }
    } catch (e) {
      console.error("Failed to notify vendor about review:", e);
    }

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
