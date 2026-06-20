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
      shopName,
      logo,
      description, 
      bankName, 
      bankOwner, 
      bankAccount 
    } = req.body;

    const updated = await vendorsService.updateVendorProfile(userId, {
      shopName,
      logo,
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

export const getVendorHotels = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotels = await vendorsService.getVendorHotels(userId);
    res.status(200).json({ success: true, data: hotels });
  } catch (error: any) {
    console.error('Error fetching vendor hotels:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách khách sạn', error: error.message });
  }
};

export const createVendorHotel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      name,
      description,
      address,
      city,
      stars,
      latitude,
      longitude,
      images,
      amenities
    } = req.body;

    if (!name || !description || !address || !city || stars === undefined) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin bắt buộc của khách sạn' });
    }

    const hotel = await vendorsService.createVendorHotel(userId, {
      name,
      description,
      address,
      city,
      stars: Number(stars),
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      images: images ? JSON.stringify(images) : "[]",
      amenities: amenities ? JSON.stringify(amenities) : "[]"
    });

    res.status(201).json({ success: true, message: 'Tạo khách sạn thành công, chờ duyệt', data: hotel });
  } catch (error: any) {
    console.error('Error creating vendor hotel:', error);
    res.status(500).json({ message: 'Lỗi khi tạo khách sạn', error: error.message });
  }
};

export const updateVendorHotel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotelId = getIdParam(req.params.hotelId);
    
    const {
      name,
      description,
      address,
      city,
      stars,
      latitude,
      longitude,
      images,
      amenities,
      isActive
    } = req.body;

    const hotel = await vendorsService.updateVendorHotel(userId, hotelId, {
      name,
      description,
      address,
      city,
      stars: stars !== undefined ? Number(stars) : undefined,
      latitude: latitude !== undefined ? Number(latitude) : undefined,
      longitude: longitude !== undefined ? Number(longitude) : undefined,
      images: images ? JSON.stringify(images) : undefined,
      amenities: amenities ? JSON.stringify(amenities) : undefined,
      isActive
    });

    res.status(200).json({ success: true, message: 'Cập nhật khách sạn thành công', data: hotel });
  } catch (error: any) {
    console.error('Error updating vendor hotel:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật khách sạn', error: error.message });
  }
};

export const deleteVendorHotel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotelId = getIdParam(req.params.hotelId);
    
    await vendorsService.deleteVendorHotel(userId, hotelId);

    res.status(200).json({ success: true, message: 'Xóa khách sạn thành công' });
  } catch (error: any) {
    console.error('Error deleting vendor hotel:', error);
    res.status(500).json({ message: 'Lỗi khi xóa khách sạn', error: error.message });
  }
};

export const getVendorHotelRooms = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotelId = getIdParam(req.params.hotelId);
    const rooms = await vendorsService.getVendorHotelRooms(userId, hotelId);
    res.status(200).json({ success: true, data: rooms });
  } catch (error: any) {
    console.error('Error fetching vendor hotel rooms:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách phòng', error: error.message });
  }
};

export const createVendorHotelRoom = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotelId = getIdParam(req.params.hotelId);
    const {
      roomNumber,
      type,
      price,
      capacity,
      description,
      images,
      amenities
    } = req.body;

    if (!roomNumber || !type || price === undefined || capacity === undefined) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin bắt buộc của phòng' });
    }

    const room = await vendorsService.createVendorHotelRoom(userId, hotelId, {
      roomNumber,
      type,
      price: Number(price),
      capacity: Number(capacity),
      description,
      images: images ? JSON.stringify(images) : "[]",
      amenities: amenities ? JSON.stringify(amenities) : "[]"
    });

    res.status(201).json({ success: true, message: 'Tạo phòng thành công', data: room });
  } catch (error: any) {
    console.error('Error creating vendor hotel room:', error);
    res.status(500).json({ message: 'Lỗi khi tạo phòng', error: error.message });
  }
};

export const updateVendorHotelRoom = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotelId = getIdParam(req.params.hotelId);
    const roomId = getIdParam(req.params.roomId);
    
    const {
      roomNumber,
      type,
      price,
      capacity,
      description,
      images,
      amenities,
      isAvailable
    } = req.body;

    const room = await vendorsService.updateVendorHotelRoom(userId, hotelId, roomId, {
      roomNumber,
      type,
      price: price !== undefined ? Number(price) : undefined,
      capacity: capacity !== undefined ? Number(capacity) : undefined,
      description,
      images: images ? JSON.stringify(images) : undefined,
      amenities: amenities ? JSON.stringify(amenities) : undefined,
      isAvailable
    });

    res.status(200).json({ success: true, message: 'Cập nhật phòng thành công', data: room });
  } catch (error: any) {
    console.error('Error updating vendor hotel room:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật phòng', error: error.message });
  }
};

export const deleteVendorHotelRoom = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const hotelId = getIdParam(req.params.hotelId);
    const roomId = getIdParam(req.params.roomId);
    
    await vendorsService.deleteVendorHotelRoom(userId, hotelId, roomId);

    res.status(200).json({ success: true, message: 'Xóa phòng thành công' });
  } catch (error: any) {
    console.error('Error deleting vendor hotel room:', error);
    res.status(500).json({ message: 'Lỗi khi xóa phòng', error: error.message });
  }
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
