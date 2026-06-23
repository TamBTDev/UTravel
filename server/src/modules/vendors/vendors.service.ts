import prisma from "../../config/database";
import { USER_ROLES, VENDOR_STATUS } from "../../../../shared/constants/roles";

export interface RegisterVendorInput {
  userId: number;
  shopName: string;
  description?: string;
  businessLicense?: string;
  bankName: string;
  bankOwner: string;
  bankAccount: string;
}

export interface UpdateVendorInput {
  description?: string;
  bankName?: string;
  bankOwner?: string;
  bankAccount?: string;
}

export const vendorsService = {
  registerVendor: async (data: RegisterVendorInput) => {
    const existingVendor = await prisma.vendorProfile.findUnique({
      where: { userId: data.userId },
    });

    if (existingVendor) {
      throw new Error("Bạn đã đăng ký trở thành đối tác rồi");
    }

    const existingShopName = await prisma.vendorProfile.findUnique({
      where: { shopName: data.shopName },
    });

    if (existingShopName) {
      throw new Error("Tên cửa hàng đã được sử dụng, vui lòng chọn tên khác");
    }

    // Atomic transaction for vendor profile, wallet creation, and role update
    return await prisma.$transaction(async (tx) => {
      const vendor = await tx.vendorProfile.create({
        data: {
          userId: data.userId,
          shopName: data.shopName,
          description: data.description,
          businessLicense: data.businessLicense,
          bankName: data.bankName,
          bankOwner: data.bankOwner,
          bankAccount: data.bankAccount,
          status: VENDOR_STATUS.PENDING,
          commissionRate: 10,
        },
      });

      await tx.wallet.create({
        data: {
          vendorId: vendor.id,
          balance: 0,
        },
      });

      await tx.user.update({
        where: { id: data.userId },
        data: { role: USER_ROLES.VENDOR },
      });

      return vendor;
    });
  },

  getVendorProfile: async (userId: number) => {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId },
      include: {
        wallet: true,
        _count: {
          select: { hotels: true },
        },
      },
    });

    if (!vendor) {
      throw new Error("Không tìm thấy hồ sơ đối tác");
    }

    return vendor;
  },

  updateVendorProfile: async (userId: number, data: UpdateVendorInput) => {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new Error("Không tìm thấy hồ sơ đối tác");
    }

    return await prisma.vendorProfile.update({
      where: { userId },
      data: {
        description:
          data.description !== undefined
            ? data.description
            : vendor.description,
        bankName: data.bankName || vendor.bankName,
        bankOwner: data.bankOwner || vendor.bankOwner,
        bankAccount: data.bankAccount || vendor.bankAccount,
      },
    });
  },

  // === QUẢN LÝ ĐƠN HÀNG (VENDOR) ===
  getVendorBookings: async (userId: number) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    return await prisma.booking.findMany({
      where: {
        room: {
          hotel: {
            vendorId: vendor.id,
          },
        },
      },
      include: {
        room: { 
          select: { 
            roomNumber: true, 
            type: true, 
            hotel: { select: { name: true } } 
          } 
        },
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        payment: { select: { method: true, status: true, amount: true } }
      },
      orderBy: { createdAt: "desc" },
    });
  },

  updateVendorBookingStatus: async (userId: number, bookingId: number, status: string) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    // Vendor chỉ được xác nhận hoặc hủy đơn
    // Việc hoàn thành (COMPLETED) và payout phải do KHÁCH HÀNG xác nhận
    // để đảm bảo khách hàng thực sự đã ở và hài lòng — tránh vendor tự hoàn thành để nhận tiền
    const allowedStatuses = ['CONFIRMED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Vendor không được phép chuyển sang trạng thái "${status}". Chỉ được phép: Xác nhận (CONFIRMED) hoặc Hủy (CANCELLED).`);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { room: { include: { hotel: true } } },
    });

    if (!booking) throw new Error("Không tìm thấy đơn hàng");
    if (booking.room.hotel.vendorId !== vendor.id) {
      throw new Error("Không có quyền cập nhật đơn hàng này");
    }

    // Vendor chỉ được CONFIRM khi booking đang PENDING
    if (status === 'CONFIRMED' && booking.status !== 'PENDING') {
      throw new Error("Chỉ có thể xác nhận đơn đang ở trạng thái Chờ xử lý (PENDING)");
    }

    // Vendor chỉ được CANCEL khi booking chưa COMPLETED
    if (status === 'CANCELLED' && booking.status === 'COMPLETED') {
      throw new Error("Không thể hủy đơn đã hoàn thành");
    }

    // Quy tắc hủy theo thời gian (áp dụng cho cả vendor lẫn khách)
    if (status === 'CANCELLED') {
      const now = new Date();
      const checkIn = new Date(booking.checkInDate);
      const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (now >= checkIn) {
        throw new Error("Không thể hủy đặt phòng sau ngày nhận phòng. Đơn đã bắt đầu kỳ lưu trú.");
      }

      if (booking.status === 'CONFIRMED' && hoursUntilCheckIn < 24) {
        throw new Error(`Không thể hủy trong vòng 24 giờ trước ngày nhận phòng (còn ${Math.floor(hoursUntilCheckIn)} giờ). Liên hệ bộ phận hỗ trợ.`);
      }
    }

    // Nếu vendor xác nhận đơn CASH → cũng cập nhật payment thành COMPLETED
    // Vendor xác nhận = họ đồng ý nhận khách và sẽ thu tiền mặt tại quầy
    if (status === 'CONFIRMED') {
      const payment = await prisma.payment.findUnique({ where: { bookingId } });
      if (payment && payment.method === 'CASH') {
        return await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'COMPLETED', paidAt: new Date() },
          });
          return tx.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED', paymentStatus: 'COMPLETED' },
          });
        });
      }
    }

    return await prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as any },
    });
  },

  // === BÁO CÁO DOANH THU (VENDOR) ===
  getVendorRevenueReport: async (userId: number) => {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId },
      include: { wallet: true },
    });

    if (!vendor || !vendor.wallet) {
      throw new Error("Không tìm thấy ví của đối tác");
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: vendor.wallet.id },
      include: {
        booking: {
          select: { id: true, checkInDate: true, checkOutDate: true, room: { include: { hotel: { select: { name: true } } } } }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Tính tổng doanh thu từ BOOKING_INCOME
    const totalRevenue = transactions
      .filter((t) => t.type === "BOOKING_INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      walletBalance: vendor.wallet.balance,
      totalRevenue,
      transactions,
    };
  },

  // === QUẢN LÝ BÌNH LUẬN (VENDOR) ===
  getVendorReviews: async (userId: number) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    return await prisma.review.findMany({
      where: {
        hotel: { vendorId: vendor.id },
      },
      include: {
        hotel: { select: { name: true } },
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  replyToReview: async (userId: number, reviewId: number, reply: string) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { hotel: true },
    });

    if (!review) throw new Error("Không tìm thấy bình luận");
    if (review.hotel.vendorId !== vendor.id) {
      throw new Error("Không có quyền trả lời bình luận này");
    }

    return await prisma.review.update({
      where: { id: reviewId },
      data: {
        vendorReply: reply,
        vendorReplyAt: new Date(),
      },
    });
  },

  resetVendorProfile: async (userId: number) => {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new Error("Không tìm thấy hồ sơ đối tác");
    }

    if (vendor.status !== "REJECTED") {
      throw new Error("Chỉ có thể đặt lại hồ sơ khi yêu cầu bị từ chối phê duyệt");
    }

    return await prisma.$transaction(async (tx) => {
      // Delete Wallet if exists
      await tx.wallet.deleteMany({
        where: { vendorId: vendor.id },
      });

      // Delete Vendor Profile
      await tx.vendorProfile.delete({
        where: { id: vendor.id },
      });

      // Downgrade user role back to USER
      await tx.user.update({
        where: { id: userId },
        data: { role: USER_ROLES.USER },
      });

      return { success: true };
    });
  },

  getVendorDashboardStats: async (userId: number) => {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId },
      include: { wallet: true },
    });

    if (!vendor) {
      throw new Error("Không tìm thấy hồ sơ đối tác");
    }

    // 1. Available rooms count
    const totalRooms = await prisma.room.count({
      where: { hotel: { vendorId: vendor.id } },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const occupiedRoomsCount = await prisma.booking.count({
      where: {
        room: { hotel: { vendorId: vendor.id } },
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        checkInDate: { lte: today },
        checkOutDate: { gte: today },
      },
    });
    const availableRooms = Math.max(0, totalRooms - occupiedRoomsCount);

    // 2. New bookings count (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newBookingsCount = await prisma.booking.count({
      where: {
        room: { hotel: { vendorId: vendor.id } },
        createdAt: { gte: oneDayAgo },
      },
    });

    // 3. Average review rating
    const reviewsAggregate = await prisma.review.aggregate({
      where: { hotel: { vendorId: vendor.id } },
      _avg: { rating: true },
    });
    const averageRating = reviewsAggregate._avg.rating
      ? Math.round(reviewsAggregate._avg.rating * 10) / 10
      : 0.0;

    // 4. Recent bookings list
    const recentBookings = await prisma.booking.findMany({
      where: { room: { hotel: { vendorId: vendor.id } } },
      include: {
        room: {
          select: {
            roomNumber: true,
            type: true,
            price: true,
            hotel: { select: { name: true } },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // 5. Monthly revenue chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const revenueTransactions = vendor.wallet
      ? await prisma.walletTransaction.findMany({
          where: {
            walletId: vendor.wallet.id,
            type: "BOOKING_INCOME",
            createdAt: { gte: sixMonthsAgo },
          },
          select: { amount: true, createdAt: true },
        })
      : [];

    // Group revenue by month
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        month: d.toLocaleString("vi-VN", { month: "long" }),
        year: d.getFullYear(),
        revenue: 0,
        monthIndex: d.getMonth(),
      };
    });

    revenueTransactions.forEach((tx) => {
      const txDate = new Date(tx.createdAt);
      const match = months.find(
        (m) =>
          m.monthIndex === txDate.getMonth() && m.year === txDate.getFullYear()
      );
      if (match) {
        match.revenue += tx.amount;
      }
    });

    const revenueData = months.map((m) => ({
      name: m.month,
      revenue: m.revenue,
    }));

    return {
      walletBalance: vendor.wallet?.balance || 0,
      availableRooms,
      newBookingsCount,
      averageRating,
      recentBookings,
      revenueData,
    };
  },

  // ══════════════════════════════════════════════════════════
  // QUẢN LÝ CHỖ NGHỈ (HOTEL + ROOM)
  // ══════════════════════════════════════════════════════════

  getVendorHotels: async (userId: number) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    return await prisma.hotel.findMany({
      where: { vendorId: vendor.id },
      include: {
        _count: { select: { rooms: true, reviews: true } },
        rooms: { select: { id: true, roomNumber: true, type: true, price: true, isAvailable: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  createVendorHotel: async (userId: number, data: any) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");
    if (vendor.status !== "APPROVED") throw new Error("Tài khoản đối tác chưa được phê duyệt");

    return await prisma.hotel.create({
      data: {
        vendorId: vendor.id,
        name: data.name,
        description: data.description ?? undefined,
        location: data.location,
        city: data.city,
        country: data.country || "Vietnam",
        amenities: data.amenities ? JSON.stringify(data.amenities) : undefined,
        images: data.images ? JSON.stringify(data.images) : undefined,
        approvalStatus: "PENDING",
        isActive: true,
      },
    });
  },

  updateVendorHotel: async (userId: number, hotelId: number, data: any) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new Error("Không tìm thấy khách sạn");
    if (hotel.vendorId !== vendor.id) throw new Error("Không có quyền sửa khách sạn này");

    return await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        name: data.name ?? hotel.name,
        description: data.description ?? hotel.description ?? undefined,
        location: data.location ?? hotel.location,
        city: data.city ?? hotel.city,
        country: data.country ?? hotel.country,
        amenities: data.amenities !== undefined ? JSON.stringify(data.amenities) : (hotel.amenities as any ?? undefined),
        images: data.images !== undefined ? JSON.stringify(data.images) : (hotel.images as any ?? undefined),
        isActive: data.isActive !== undefined ? data.isActive : hotel.isActive,
      },
    });
  },

  deleteVendorHotel: async (userId: number, hotelId: number) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new Error("Không tìm thấy khách sạn");
    if (hotel.vendorId !== vendor.id) throw new Error("Không có quyền xóa khách sạn này");
    if (hotel.approvalStatus === "APPROVED") throw new Error("Không thể xóa khách sạn đã được duyệt. Hãy tắt hiển thị thay thế.");

    return await prisma.hotel.delete({ where: { id: hotelId } });
  },

  getVendorRooms: async (userId: number, hotelId: number) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel || hotel.vendorId !== vendor.id) throw new Error("Không có quyền truy cập khách sạn này");

    return await prisma.room.findMany({
      where: { hotelId },
      orderBy: { roomNumber: "asc" },
    });
  },

  createVendorRoom: async (userId: number, hotelId: number, data: any) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel || hotel.vendorId !== vendor.id) throw new Error("Không có quyền thêm phòng vào khách sạn này");

    return await prisma.room.create({
      data: {
        hotelId,
        roomNumber: data.roomNumber,
        type: data.type,
        price: Number(data.price),
        capacity: Number(data.capacity) || 2,
        description: data.description ?? undefined,
        amenities: data.amenities ? JSON.stringify(data.amenities) : undefined,
        images: data.images ? JSON.stringify(data.images) : undefined,
        isAvailable: true,
      },
    });
  },

  updateVendorRoom: async (userId: number, hotelId: number, roomId: number, data: any) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel || hotel.vendorId !== vendor.id) throw new Error("Không có quyền sửa phòng này");

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room || room.hotelId !== hotelId) throw new Error("Không tìm thấy phòng");

    return await prisma.room.update({
      where: { id: roomId },
      data: {
        roomNumber: data.roomNumber ?? room.roomNumber,
        type: data.type ?? room.type,
        price: data.price !== undefined ? Number(data.price) : room.price,
        capacity: data.capacity !== undefined ? Number(data.capacity) : room.capacity,
        description: data.description ?? room.description ?? undefined,
        amenities: data.amenities !== undefined ? JSON.stringify(data.amenities) : (room.amenities as any ?? undefined),
        images: data.images !== undefined ? JSON.stringify(data.images) : (room.images as any ?? undefined),
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : room.isAvailable,
      },
    });
  },

  deleteVendorRoom: async (userId: number, hotelId: number, roomId: number) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel || hotel.vendorId !== vendor.id) throw new Error("Không có quyền xóa phòng này");

    return await prisma.room.delete({ where: { id: roomId } });
  },

  // ══════════════════════════════════════════════════════════
  // YÊU CẦU RÚT TIỀN (WITHDRAW REQUEST)
  // ══════════════════════════════════════════════════════════

  createWithdrawRequest: async (userId: number, amount: number, note?: string) => {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId },
      include: { wallet: true },
    });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");
    if (!vendor.wallet) throw new Error("Không tìm thấy ví đối tác");
    if (vendor.wallet.balance < amount) throw new Error("Số dư ví không đủ để thực hiện yêu cầu rút tiền");
    if (amount < 100000) throw new Error("Số tiền rút tối thiểu là 100.000 VNĐ");

    // Check no pending request exists
    const pending = await prisma.withdrawRequest.findFirst({
      where: { vendorId: vendor.id, status: "PENDING" },
    });
    if (pending) throw new Error("Bạn đang có yêu cầu rút tiền chờ xử lý. Vui lòng đợi kết quả trước khi tạo yêu cầu mới.");

    return await prisma.withdrawRequest.create({
      data: {
        vendorId: vendor.id,
        walletId: vendor.wallet.id,
        amount,
        bankName: vendor.bankName || "",
        bankAccount: vendor.bankAccount || "",
        bankOwner: vendor.bankOwner || "",
        note,
        status: "PENDING",
      },
    });
  },

  getVendorWithdrawRequests: async (userId: number) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    return await prisma.withdrawRequest.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
    });
  },

  // === QUẢN LÝ KHUYẾN MÃI (PROMOTION) ===
  getVendorPromotions: async (userId: number) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");
    return await prisma.promotion.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
    });
  },

  createVendorPromotion: async (userId: number, data: any) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");
    if (!data.code || !data.name || !data.discountValue || !data.startDate || !data.endDate) {
      throw new Error("Thiếu thông tin bắt buộc");
    }
    
    // Check if code exists
    const existing = await prisma.promotion.findUnique({ where: { code: data.code } });
    if (existing) throw new Error("Mã khuyến mãi này đã tồn tại trên hệ thống");

    return await prisma.promotion.create({
      data: {
        vendorId: vendor.id,
        code: data.code,
        name: data.name,
        description: data.description,
        discountType: data.discountType || "percentage",
        discountValue: Number(data.discountValue),
        minOrderValue: Number(data.minOrderValue || 0),
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  },

  updateVendorPromotion: async (userId: number, promoId: number, data: any) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    const promo = await prisma.promotion.findUnique({ where: { id: promoId } });
    if (!promo || promo.vendorId !== vendor.id) {
      throw new Error("Không tìm thấy khuyến mãi hoặc không có quyền sửa");
    }

    if (data.code && data.code !== promo.code) {
      const existing = await prisma.promotion.findUnique({ where: { code: data.code } });
      if (existing) throw new Error("Mã khuyến mãi mới đã tồn tại");
    }

    return await prisma.promotion.update({
      where: { id: promoId },
      data: {
        code: data.code !== undefined ? data.code : undefined,
        name: data.name !== undefined ? data.name : undefined,
        description: data.description !== undefined ? data.description : undefined,
        discountType: data.discountType !== undefined ? data.discountType : undefined,
        discountValue: data.discountValue !== undefined ? Number(data.discountValue) : undefined,
        minOrderValue: data.minOrderValue !== undefined ? Number(data.minOrderValue) : undefined,
        maxDiscount: data.maxDiscount !== undefined ? Number(data.maxDiscount) : undefined,
        usageLimit: data.usageLimit !== undefined ? Number(data.usageLimit) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });
  },

  deleteVendorPromotion: async (userId: number, promoId: number) => {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vendor) throw new Error("Không tìm thấy hồ sơ đối tác");

    const promo = await prisma.promotion.findUnique({ where: { id: promoId } });
    if (!promo || promo.vendorId !== vendor.id) {
      throw new Error("Không tìm thấy khuyến mãi hoặc không có quyền xóa");
    }

    if (promo.usedCount > 0) {
      throw new Error("Không thể xóa mã khuyến mãi đã có lượt sử dụng. Vui lòng chọn Tạm ngưng (isActive = false).");
    }

    return await prisma.promotion.delete({
      where: { id: promoId },
    });
  },
};
