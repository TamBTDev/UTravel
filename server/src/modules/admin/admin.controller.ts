import { Request, Response } from "express";
import { adminService } from "./admin.service";
import { VENDOR_STATUS, APPROVAL_STATUS } from "../../../../shared/constants/roles";

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
