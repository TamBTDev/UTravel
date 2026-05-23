import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { USER_ROLES } from '../../../../shared/constants/roles';
import { 
  registerVendor, 
  getVendorProfile, 
  updateVendorProfile,
  getVendorBookings,
  updateVendorBookingStatus
} from './vendors.controller';

const router = Router();

// Tất cả route đều yêu cầu đăng nhập
router.use(authMiddleware);

// POST /api/vendors/register - Đăng ký trở thành Vendor (USER role cũng gọi được)
router.post('/register', registerVendor);

// GET /api/vendors/profile - Lấy thông tin Vendor của chính mình (chỉ VENDOR mới gọi được)
router.get('/profile', requireRole(USER_ROLES.VENDOR), getVendorProfile);

// PATCH /api/vendors/profile - Cập nhật thông tin ngân hàng/mô tả
router.patch('/profile', requireRole(USER_ROLES.VENDOR), updateVendorProfile);

// === QUẢN LÝ ĐƠN HÀNG ===
// GET /api/vendors/bookings - Lấy danh sách đơn đặt phòng của các khách sạn thuộc vendor
router.get('/bookings', requireRole(USER_ROLES.VENDOR), getVendorBookings);

// PATCH /api/vendors/bookings/:id/status - Duyệt/Từ chối đơn hàng
router.patch('/bookings/:id/status', requireRole(USER_ROLES.VENDOR), updateVendorBookingStatus);

export default router;
