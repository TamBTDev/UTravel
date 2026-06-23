import { Router } from "express";
import { authMiddleware, requireRole, requirePermission } from "../../middlewares/auth.middleware";
import { USER_ROLES } from "../../../../shared/constants/roles";
import {
  getPendingVendors,
  updateVendorStatus,
  getPendingHotels,
  updateHotelStatus,
  getAdminFinanceReport,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getAllAdminHotels,
  toggleHotelActive,
  getAdminDashboardStats,
  getWithdrawRequests,
  approveWithdrawRequest,
  rejectWithdrawRequest,
} from "./admin.controller";

const router = Router();

// Toàn bộ module admin yêu cầu đăng nhập và có role là ADMIN hoặc MANAGER
router.use(authMiddleware);
router.use(requireRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER));

// --- Duyệt Vendor Profile ---
// Lấy danh sách các Vendor đang chờ duyệt (PENDING)
router.get("/vendors/pending", requirePermission("APPROVE_VENDOR"), getPendingVendors);

// Phê duyệt hoặc từ chối Vendor (status: APPROVED | REJECTED)
router.patch("/vendors/:id/status", requirePermission("APPROVE_VENDOR"), updateVendorStatus);


// --- Duyệt Khách sạn (Hotel) ---
// Lấy danh sách Khách sạn mới đăng chờ duyệt
router.get("/hotels/pending", requirePermission("APPROVE_HOTEL"), getPendingHotels);

// Phê duyệt hoặc từ chối Khách sạn
router.patch("/hotels/:id/status", requirePermission("APPROVE_HOTEL"), updateHotelStatus);

// --- Quản lý Tài chính (Finance) ---
// Lấy báo cáo doanh thu từ phí hoa hồng của sàn
router.get("/finance-report", requirePermission("VIEW_FINANCE"), getAdminFinanceReport);

// --- Quản lý Người dùng ---
// Lấy danh sách tất cả người dùng (hỗ trợ search, filter role/status)
router.get("/users", requirePermission("MANAGE_USERS"), getAllUsers);

// Khóa hoặc mở khóa tài khoản người dùng
router.patch("/users/:id/status", requirePermission("MANAGE_USERS"), updateUserStatus);

// Phân quyền cho người dùng (Role và Permissions)
router.patch("/users/:id/role", requirePermission("MANAGE_USERS"), updateUserRole);

// --- Quản lý Sản phẩm (Hotels) toàn sàn ---
// Lấy danh sách toàn bộ khách sạn trên sàn (hỗ trợ lọc theo isActive)
router.get("/hotels", requirePermission("APPROVE_HOTEL"), getAllAdminHotels);

// Bật/tắt trạng thái hoạt động của khách sạn (Khóa khách sạn)
router.patch("/hotels/:id/active", requirePermission("APPROVE_HOTEL"), toggleHotelActive);

// --- Dashboard Tổng quan ---
router.get("/dashboard", getAdminDashboardStats);

// --- Duyệt Yêu cầu Rút tiền ---
router.get("/withdraw-requests", getWithdrawRequests);
router.patch("/withdraw-requests/:id/approve", approveWithdrawRequest);
router.patch("/withdraw-requests/:id/reject", rejectWithdrawRequest);

export default router;
