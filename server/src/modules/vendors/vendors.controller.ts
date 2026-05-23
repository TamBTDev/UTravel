import { Request, Response } from 'express';
import { USER_ROLES } from '../../../../shared/constants/roles';
import { vendorsService } from './vendors.service';

export const registerVendor = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { 
      shopName, 
      description, 
      businessLicense, 
      bankName, 
      bankOwner, 
      bankAccount 
    } = req.body;

    if (!shopName || !bankName || !bankOwner || !bankAccount) {
      return res.status(400).json({ 
        message: 'Thiếu các trường bắt buộc: shopName, bankName, bankOwner, bankAccount' 
      });
    }

    const result = await vendorsService.registerVendor({
      userId,
      shopName,
      description,
      businessLicense,
      bankName,
      bankOwner,
      bankAccount
    });

    res.status(201).json({ 
      success: true,
      message: 'Đăng ký đối tác thành công. Vui lòng chờ quản trị viên phê duyệt.',
      data: result 
    });

  } catch (error: any) {
    console.error('Error registering vendor:', error);
    if (error.message === 'Bạn đã đăng ký trở thành đối tác rồi' || 
        error.message === 'Tên cửa hàng đã được sử dụng, vui lòng chọn tên khác') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký đối tác', error: error.message });
  }
};

export const getVendorProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const vendor = await vendorsService.getVendorProfile(userId);

    if (vendor.userId !== userId && (req as any).user?.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    res.status(200).json({ success: true, data: vendor });
  } catch (error: any) {
    console.error('Error fetching vendor profile:', error);
    if (error.message === 'Không tìm thấy hồ sơ đối tác') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi khi lấy thông tin đối tác', error: error.message });
  }
};

export const updateVendorProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { 
      description, 
      bankName, 
      bankOwner, 
      bankAccount 
    } = req.body;

    const updated = await vendorsService.updateVendorProfile(userId, {
      description,
      bankName,
      bankOwner,
      bankAccount
    });

    res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updated });
  } catch (error: any) {
    console.error('Error updating vendor profile:', error);
    if (error.message === 'Không tìm thấy hồ sơ đối tác') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi khi cập nhật thông tin đối tác', error: error.message });
  }
};

const getIdParam = (val: any): number => {
  if (Array.isArray(val)) return Number(val[0]);
  return Number(val);
};

export const getVendorBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const bookings = await vendorsService.getVendorBookings(userId);
    res.status(200).json({ success: true, data: bookings });
  } catch (error: any) {
    console.error('Error fetching vendor bookings:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng', error: error.message });
  }
};

export const updateVendorBookingStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const bookingId = getIdParam(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái mới' });
    }

    const updated = await vendorsService.updateVendorBookingStatus(userId, bookingId, status);
    res.status(200).json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công', data: updated });
  } catch (error: any) {
    console.error('Error updating vendor booking status:', error);
    if (error.message === 'Không tìm thấy hồ sơ đối tác' || 
        error.message === 'Không tìm thấy đơn hàng' ||
        error.message === 'Không có quyền cập nhật đơn hàng này') {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi khi cập nhật đơn hàng', error: error.message });
  }
};
