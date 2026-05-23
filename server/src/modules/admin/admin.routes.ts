import { Router } from "express";
import { authMiddleware, requireRole } from "../../middlewares/auth.middleware";
import { USER_ROLES } from "../../../../shared/constants/roles";
import {
  getPendingVendors,
  updateVendorStatus,
  getPendingHotels,
  updateHotelStatus,
  getAdminFinanceReport,
  getAllUsers,
  updateUserStatus
} from "./admin.controller";

const router = Router();

// Toàn bộ module admin yêu cầu đăng nhập và có role là ADMIN
router.use(authMiddleware);
router.use(requireRole(USER_ROLES.ADMIN));

// --- Duyệt Vendor Profile ---
// Lấy danh sách các Vendor đang chờ duyệt (PENDING)
router.get("/vendors/pending", getPendingVendors);

// Phê duyệt hoặc từ chối Vendor (status: APPROVED | REJECTED)
router.patch("/vendors/:id/status", updateVendorStatus);


// --- Duyệt Khách sạn (Hotel) ---
// Lấy danh sách Khách sạn mới đăng chờ duyệt
router.get("/hotels/pending", getPendingHotels);

// Phê duyệt hoặc từ chối Khách sạn
router.patch("/hotels/:id/status", updateHotelStatus);

// --- Quản lý Tài chính (Finance) ---
// Lấy báo cáo doanh thu từ phí hoa hồng của sàn
router.get("/finance-report", getAdminFinanceReport);

// --- Quản lý Người dùng ---
// Lấy danh sách tất cả người dùng (hỗ trợ search, filter role/status)
router.get("/users", getAllUsers);

// Khóa hoặc mở khóa tài khoản người dùng
router.patch("/users/:id/status", updateUserStatus);

export default router;
