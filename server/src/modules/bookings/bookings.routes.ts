import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  createBooking,
  getUserBookings,
  updateBooking,
  getBookingDetail,
} from './bookings.controller';

const router = Router();

// All booking routes require authentication
router.use(authMiddleware);

// Create booking
router.post('/', createBooking);

// Get user's bookings
router.get('/', getUserBookings);

// Get specific booking detail
router.get('/:id', getBookingDetail);

// Update booking status
router.patch('/:id', updateBooking);

export default router;
