import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  createPayment,
  getPaymentStatus,
  updatePaymentStatus,
} from './payments.controller';

const router = Router();

// All payment routes require authentication
router.use(authMiddleware);

// Create payment
router.post('/', createPayment);

// Get payment status
router.get('/:id', getPaymentStatus);

// Update payment status (admin only)
router.patch('/:id', updatePaymentStatus);

export default router;
