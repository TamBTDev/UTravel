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

export const getVendorRevenueReport = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const report = await vendorsService.getVendorRevenueReport(userId);
    res.status(200).json({ success: true, data: report });
  } catch (error: any) {
    console.error('Error fetching vendor revenue report:', error);
    if (error.message === 'Không tìm thấy ví của đối tác') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi lấy báo cáo doanh thu', error: error.message });
  }
};

export const getVendorReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const reviews = await vendorsService.getVendorReviews(userId);
    res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    console.error('Error fetching vendor reviews:', error);
    res.status(500).json({ message: 'Lỗi lấy danh sách bình luận', error: error.message });
  }
};

export const replyToReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const reviewId = getIdParam(req.params.id);
    const { reply } = req.body;

    if (!reply || reply.trim() === '') {
      return res.status(400).json({ message: 'Vui lòng nhập nội dung phản hồi' });
    }

    const updated = await vendorsService.replyToReview(userId, reviewId, reply);
    res.status(200).json({ success: true, message: 'Phản hồi bình luận thành công', data: updated });
  } catch (error: any) {
    console.error('Error replying to review:', error);
    if (error.message === 'Không tìm thấy hồ sơ đối tác' || 
        error.message === 'Không tìm thấy bình luận' ||
        error.message === 'Không có quyền trả lời bình luận này') {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi khi phản hồi bình luận', error: error.message });
  }
};

export const resetVendorProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const result = await vendorsService.resetVendorProfile(userId);
    res.status(200).json({
      success: true,
      message: 'Hồ sơ đã được đặt lại thành công. Bạn có thể gửi lại yêu cầu đăng ký mới.'
    });
  } catch (error: any) {
    console.error('Error resetting vendor profile:', error);
    if (error.message === 'Không tìm thấy hồ sơ đối tác' || 
        error.message === 'Chỉ có thể đặt lại hồ sơ khi yêu cầu bị từ chối phê duyệt') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi khi đặt lại hồ sơ đối tác', error: error.message });
  }
};

export const getVendorDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const stats = await vendorsService.getVendorDashboardStats(userId);
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error fetching vendor dashboard stats:', error);
    if (error.message === 'Không tìm thấy hồ sơ đối tác') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu bảng điều khiển đối tác', error: error.message });
  }
};

// ══════════════════════════════════════════════════════════
// QUẢN LÝ CHỖ NGHỈ (HOTEL + ROOM)
// ══════════════════════════════════════════════════════════

export const getVendorHotels = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotels = await vendorsService.getVendorHotels(userId);
    res.status(200).json({ success: true, data: hotels });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi lấy danh sách khách sạn', error: error.message });
  }
};

export const createVendorHotel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { name, description, location, city, country, amenities, images } = req.body;
    if (!name || !location || !city) {
      return res.status(400).json({ message: 'Thiếu thông tin: tên, địa điểm, thành phố' });
    }
    const hotel = await vendorsService.createVendorHotel(userId, { name, description, location, city, country, amenities, images });
    res.status(201).json({ success: true, message: 'Tạo khách sạn thành công. Vui lòng chờ Admin phê duyệt.', data: hotel });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateVendorHotel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotelId = getIdParam(req.params.id);
    const hotel = await vendorsService.updateVendorHotel(userId, hotelId, req.body);
    res.status(200).json({ success: true, message: 'Cập nhật khách sạn thành công', data: hotel });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteVendorHotel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotelId = getIdParam(req.params.id);
    await vendorsService.deleteVendorHotel(userId, hotelId);
    res.status(200).json({ success: true, message: 'Xóa khách sạn thành công' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getVendorRooms = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotelId = getIdParam(req.params.hotelId);
    const rooms = await vendorsService.getVendorRooms(userId, hotelId);
    res.status(200).json({ success: true, data: rooms });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createVendorRoom = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotelId = getIdParam(req.params.hotelId);
    const { roomNumber, type, price, capacity, description, amenities, images } = req.body;
    if (!roomNumber || !type || !price) {
      return res.status(400).json({ message: 'Thiếu thông tin: số phòng, loại phòng, giá' });
    }
    const room = await vendorsService.createVendorRoom(userId, hotelId, { roomNumber, type, price, capacity, description, amenities, images });
    res.status(201).json({ success: true, message: 'Thêm phòng thành công', data: room });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateVendorRoom = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotelId = getIdParam(req.params.hotelId);
    const roomId = getIdParam(req.params.roomId);
    const room = await vendorsService.updateVendorRoom(userId, hotelId, roomId, req.body);
    res.status(200).json({ success: true, message: 'Cập nhật phòng thành công', data: room });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteVendorRoom = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotelId = getIdParam(req.params.hotelId);
    const roomId = getIdParam(req.params.roomId);
    await vendorsService.deleteVendorRoom(userId, hotelId, roomId);
    res.status(200).json({ success: true, message: 'Xóa phòng thành công' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ══════════════════════════════════════════════════════════
// YÊU CẦU RÚT TIỀN
// ══════════════════════════════════════════════════════════

export const createWithdrawRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { amount, note } = req.body;
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ message: 'Vui lòng nhập số tiền hợp lệ' });
    }
    const request = await vendorsService.createWithdrawRequest(userId, Number(amount), note);
    res.status(201).json({ success: true, message: 'Yêu cầu rút tiền đã được gửi. Vui lòng chờ Admin xử lý.', data: request });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getVendorWithdrawRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const requests = await vendorsService.getVendorWithdrawRequests(userId);
    res.status(200).json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ══════════════════════════════════════════════════════════
// QUẢN LÝ KHUYẾN MÃI (PROMOTION)
// ══════════════════════════════════════════════════════════

export const getVendorPromotions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const promotions = await vendorsService.getVendorPromotions(userId);
    res.status(200).json({ success: true, data: promotions });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createVendorPromotion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const promotion = await vendorsService.createVendorPromotion(userId, req.body);
    res.status(201).json({ success: true, data: promotion });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateVendorPromotion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const promotionId = getIdParam(req.params.id);
    const promotion = await vendorsService.updateVendorPromotion(userId, promotionId, req.body);
    res.status(200).json({ success: true, data: promotion });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteVendorPromotion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const promotionId = getIdParam(req.params.id);
    await vendorsService.deleteVendorPromotion(userId, promotionId);
    res.status(200).json({ success: true, message: "Xóa mã khuyến mãi thành công" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
