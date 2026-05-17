import { Router } from 'express';
import { checkAvailability, getRoomDetail } from './rooms.controller';

const router = Router();

// Check room availability (public endpoint)
router.get('/:roomId/availability', checkAvailability);

// Get room details (public endpoint)
router.get('/:roomId', getRoomDetail);

export default router;
