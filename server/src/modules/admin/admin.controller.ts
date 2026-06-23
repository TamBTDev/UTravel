import { Request, Response } from "express";
import { adminService } from "./admin.service";
import { VENDOR_STATUS, APPROVAL_STATUS, USER_STATUS, USER_ROLES } from "../../../../shared/constants/roles";

const getIdParam = (val: any): number => {
  if (Array.isArray(val)) return Number(val[0]);
  return Number(val);
};

export const getPendingVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await adminService.getPendingVendors();
    res.status(200).json({ success: true, data: vendors });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách đối tác", error: error.message });
  }
};

export const updateVendorStatus = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const { status } = req.body;

    if (![VENDOR_STATUS.APPROVED, VENDOR_STATUS.REJECTED].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const updated = await adminService.approveVendor(id, status);
    res.status(200).json({ success: true, message: "Cập nhật trạng thái đối tác thành công", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật đối tác", error: error.message });
  }
};

export const getPendingHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await adminService.getPendingHotels();
    res.status(200).json({ success: true, data: hotels });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách khách sạn", error: error.message });
  }
};

export const updateHotelStatus = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const { status, rejectReason } = req.body;

    if (![APPROVAL_STATUS.APPROVED, APPROVAL_STATUS.REJECTED].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    if (status === APPROVAL_STATUS.REJECTED && !rejectReason) {
      return res.status(400).json({ message: "Vui lòng nhập lý do từ chối" });
    }

    const updated = await adminService.approveHotel(id, status, rejectReason);
    res.status(200).json({ success: true, message: "Cập nhật trạng thái khách sạn thành công", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi cập nhật khách sạn", error: error.message });
  }
};

export const getAdminFinanceReport = async (req: Request, res: Response) => {
  try {
    const report = await adminService.getAdminFinanceReport();
    res.status(200).json({ success: true, data: report });
  } catch (error: any) {
    console.error("Error fetching admin finance report:", error);
    res.status(500).json({ message: "Lỗi lấy báo cáo tài chính sàn", error: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search, role, status } = req.query;
    const users = await adminService.getAllUsers(
      search as string,
      role as string,
      status as string
    );
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Lỗi lấy danh sách người dùng", error: error.message });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const { status } = req.body;

    if (!status || ![USER_STATUS.VERIFIED, USER_STATUS.LOCKED, USER_STATUS.UNVERIFIED].includes(status as any)) {
      return res.status(400).json({ message: "Trạng thái người dùng không hợp lệ" });
    }

    const updated = await adminService.updateUserStatus(id, status);
    res.status(200).json({ success: true, message: "Cập nhật trạng thái người dùng thành công", data: updated });
  } catch (error: any) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Lỗi cập nhật người dùng", error: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const { role, permissions } = req.body;

    if (!role || !Object.values(USER_ROLES).includes(role as any)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    const updated = await adminService.updateUserRole(id, role, permissions);
    res.status(200).json({ success: true, message: "Phân quyền người dùng thành công", data: updated });
  } catch (error: any) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Lỗi phân quyền người dùng", error: error.message });
  }
};

export const getAllAdminHotels = async (req: Request, res: Response) => {
  try {
    const { search, approvalStatus, isActive } = req.query;
    let isActiveBool: boolean | undefined = undefined;
    if (isActive === 'true') isActiveBool = true;
    if (isActive === 'false') isActiveBool = false;

    const hotels = await adminService.getAllAdminHotels(
      search as string,
      approvalStatus as string,
      isActiveBool
    );
    res.status(200).json({ success: true, data: hotels });
  } catch (error: any) {
    console.error("Error fetching all hotels:", error);
    res.status(500).json({ message: "Lỗi lấy danh sách khách sạn", error: error.message });
  }
};

export const toggleHotelActive = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: "Trạng thái isActive không hợp lệ" });
    }

    const updated = await adminService.toggleHotelActive(id, isActive);
    res.status(200).json({ success: true, message: "Cập nhật trạng thái khách sạn thành công", data: updated });
  } catch (error: any) {
    console.error("Error toggling hotel status:", error);
    res.status(500).json({ message: "Lỗi cập nhật trạng thái khách sạn", error: error.message });
  }
};

export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getAdminDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    console.error("Error fetching admin dashboard stats:", error);
    res.status(500).json({ message: "Lỗi lấy thống kê tổng quan", error: error.message });
  }
};

// ══════════════════════════════════════════════════════════
// DUYỆT YÊU CẦU RÚT TIỀN
// ══════════════════════════════════════════════════════════

export const getWithdrawRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const requests = await adminService.getWithdrawRequests(status as string);
    res.status(200).json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy danh sách yêu cầu rút tiền", error: error.message });
  }
};

export const approveWithdrawRequest = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const result = await adminService.approveWithdrawRequest(id);
    res.status(200).json({ success: true, message: "Đã duyệt và xử lý rút tiền thành công", data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectWithdrawRequest = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const { adminNote } = req.body;
    const result = await adminService.rejectWithdrawRequest(id, adminNote);
    res.status(200).json({ success: true, message: "Đã từ chối yêu cầu rút tiền", data: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
