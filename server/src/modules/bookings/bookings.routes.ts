import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  createBooking,
  getUserBookings,
  updateBooking,
  getBookingDetail,
  validatePromotion,
  completeBooking,
} from './bookings.controller';

const router = Router();

// All booking routes require authentication
router.use(authMiddleware);

// Create booking
router.post('/', createBooking);

// Validate promotion
router.get('/validate-promo', validatePromotion);

// Get user's bookings
router.get('/', getUserBookings);

// Get specific booking detail
router.get('/:id', getBookingDetail);

// Complete booking and process vendor payout
router.patch('/:id/complete', completeBooking);

// Update booking status
router.patch('/:id', updateBooking);

export default router;
