import { Router } from "express";
import { authMiddleware, requireRole } from "../../middlewares/auth.middleware";
import { USER_ROLES } from "../../../../shared/constants/roles";
import {
  getPendingVendors,
  updateVendorStatus,
  getPendingHotels,
  updateHotelStatus,
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

export default router;
