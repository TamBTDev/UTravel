import { Router } from 'express';
import { createReview, getHotelReviews } from './reviews.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createReview);
router.get('/hotel/:hotelId', getHotelReviews);

export default router;
