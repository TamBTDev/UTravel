import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { USER_ROLES } from '../../../../shared/constants/roles';
import { 
  registerVendor, 
  getVendorProfile, 
  updateVendorProfile,
  getVendorBookings,
  updateVendorBookingStatus,
  getVendorRevenueReport,
  getVendorReviews,
  replyToReview,
  resetVendorProfile,
  getVendorDashboardStats,
  getVendorHotels,
  createVendorHotel,
  updateVendorHotel,
  deleteVendorHotel,
  getVendorHotelRooms,
  createVendorHotelRoom,
  updateVendorHotelRoom,
  deleteVendorHotelRoom,
  createWithdrawRequest,
  getVendorWithdrawRequests,
  getVendorPromotions,
  createVendorPromotion,
  updateVendorPromotion,
  deleteVendorPromotion,
} from './vendors.controller';

const router = Router();

// Tất cả route đều yêu cầu đăng nhập
router.use(authMiddleware);

// POST /api/vendors/register - Đăng ký trở thành Vendor (USER role cũng gọi được)
router.post('/register', registerVendor);

// DELETE /api/vendors/profile/reset - Reset hồ sơ đối tác bị từ chối
router.delete('/profile/reset', resetVendorProfile);

// GET /api/vendors/profile - Lấy thông tin Vendor của chính mình
router.get('/profile', requireRole(USER_ROLES.VENDOR), getVendorProfile);

// GET /api/vendors/dashboard-stats - Lấy thống kê bảng điều khiển
router.get('/dashboard-stats', requireRole(USER_ROLES.VENDOR), getVendorDashboardStats);

// PATCH /api/vendors/profile - Cập nhật thông tin
router.patch('/profile', requireRole(USER_ROLES.VENDOR), updateVendorProfile);

// === QUẢN LÝ KHÁCH SẠN (CHỖ NGHỈ) ===
// GET /api/vendors/hotels - Lấy danh sách khách sạn của vendor
router.get('/hotels', requireRole(USER_ROLES.VENDOR), getVendorHotels);

// POST /api/vendors/hotels - Tạo khách sạn mới
router.post('/hotels', requireRole(USER_ROLES.VENDOR), createVendorHotel);

// PATCH /api/vendors/hotels/:hotelId - Cập nhật khách sạn
router.patch('/hotels/:hotelId', requireRole(USER_ROLES.VENDOR), updateVendorHotel);

// DELETE /api/vendors/hotels/:hotelId - Xóa khách sạn
router.delete('/hotels/:hotelId', requireRole(USER_ROLES.VENDOR), deleteVendorHotel);

// GET /api/vendors/hotels/:hotelId/rooms - Lấy danh sách phòng
router.get('/hotels/:hotelId/rooms', requireRole(USER_ROLES.VENDOR), getVendorHotelRooms);

// POST /api/vendors/hotels/:hotelId/rooms - Thêm phòng mới
router.post('/hotels/:hotelId/rooms', requireRole(USER_ROLES.VENDOR), createVendorHotelRoom);

// PATCH /api/vendors/hotels/:hotelId/rooms/:roomId - Cập nhật phòng
router.patch('/hotels/:hotelId/rooms/:roomId', requireRole(USER_ROLES.VENDOR), updateVendorHotelRoom);

// DELETE /api/vendors/hotels/:hotelId/rooms/:roomId - Xóa phòng
router.delete('/hotels/:hotelId/rooms/:roomId', requireRole(USER_ROLES.VENDOR), deleteVendorHotelRoom);

// === QUẢN LÝ ĐƠN HÀNG ===
router.get('/bookings', requireRole(USER_ROLES.VENDOR), getVendorBookings);
router.patch('/bookings/:id/status', requireRole(USER_ROLES.VENDOR), updateVendorBookingStatus);

// === BÁO CÁO DOANH THU ===
router.get('/revenue-report', requireRole(USER_ROLES.VENDOR), getVendorRevenueReport);

// === QUẢN LÝ BÌNH LUẬN ===
router.get('/reviews', requireRole(USER_ROLES.VENDOR), getVendorReviews);
router.patch('/reviews/:id/reply', requireRole(USER_ROLES.VENDOR), replyToReview);

// Xóa block duplicate

// === YÊU CẦU RÚT TIỀN ===
router.post('/wallet/withdraw', requireRole(USER_ROLES.VENDOR), createWithdrawRequest);
router.get('/wallet/withdraws', requireRole(USER_ROLES.VENDOR), getVendorWithdrawRequests);

// === QUẢN LÝ KHUYẾN MÃI ===
router.get('/promotions', requireRole(USER_ROLES.VENDOR), getVendorPromotions);
router.post('/promotions', requireRole(USER_ROLES.VENDOR), createVendorPromotion);
router.put('/promotions/:id', requireRole(USER_ROLES.VENDOR), updateVendorPromotion);
router.delete('/promotions/:id', requireRole(USER_ROLES.VENDOR), deleteVendorPromotion);

export default router;
