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

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { room: { include: { hotel: true } } }
    });

    if (!booking) throw new Error("Không tìm thấy đơn hàng");
    if (booking.room.hotel.vendorId !== vendor.id) {
      throw new Error("Không có quyền cập nhật đơn hàng này");
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
      availableRooms,
      newBookingsCount,
      averageRating,
      recentBookings,
      revenueData,
    };
  },
};
