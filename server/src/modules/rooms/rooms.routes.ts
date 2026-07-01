import { Router } from 'express';
import { checkAvailability, getRoomDetail, getBookedDates } from './rooms.controller';

const router = Router();

// Check room availability (public endpoint)
router.get('/:roomId/availability', checkAvailability);

// Get booked date ranges for a room (public endpoint)
router.get('/:roomId/booked-dates', getBookedDates);

// Get room details (public endpoint)
router.get('/:roomId', getRoomDetail);

export default router;
