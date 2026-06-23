import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  createPayment,
  getPaymentStatus,
  getPaymentByBooking,
  updatePaymentStatus,
  sePayWebhook,
  getUserWalletBalance,
} from './payments.controller';

const router = Router();

// Public: SePay webhook (không cần auth)
router.post('/sepay-webhook', sePayWebhook);

// Protected routes — yêu cầu đăng nhập
router.use(authMiddleware);

// Tạo payment
router.post('/', createPayment);

// Lấy số dư ví của user
router.get('/wallet/balance', getUserWalletBalance);

// Polling: Kiểm tra trạng thái payment theo bookingId
router.get('/booking/:bookingId', getPaymentByBooking);

// Lấy chi tiết payment theo paymentId
router.get('/:id', getPaymentStatus);

// Admin: Cập nhật trạng thái thanh toán
router.patch('/:id', updatePaymentStatus);

export default router;
