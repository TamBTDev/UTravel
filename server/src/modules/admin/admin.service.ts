import prisma from "../../config/database";
import { VENDOR_STATUS, APPROVAL_STATUS } from "../../../../shared/constants/roles";

export const adminService = {
  // === VENDOR APPROVAL ===
  getPendingVendors: async () => {
    return await prisma.vendorProfile.findMany({
      where: { status: VENDOR_STATUS.PENDING },
      include: {
        user: { select: { email: true, firstName: true, lastName: true, phone: true } },
      },
      orderBy: { id: "desc" },
    });
  },

  approveVendor: async (vendorId: number, status: string) => {
    return await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { status: status as any },
    });
  },

  // === HOTEL APPROVAL ===
  getPendingHotels: async () => {
    return await prisma.hotel.findMany({
      where: { approvalStatus: APPROVAL_STATUS.PENDING },
      include: {
        vendor: { select: { shopName: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  approveHotel: async (hotelId: number, status: string, rejectReason?: string) => {
    return await prisma.hotel.update({
      where: { id: hotelId },
      data: { 
        approvalStatus: status as any,
        rejectReason: status === APPROVAL_STATUS.REJECTED ? rejectReason : null,
      },
    });
  },

  // === TÀI CHÍNH SÀN (ADMIN) ===
  getAdminFinanceReport: async () => {
    // Tìm tất cả giao dịch là phí hoa hồng (COMMISSION_FEE)
    const commissionTransactions = await prisma.walletTransaction.findMany({
      where: { type: "COMMISSION_FEE" },
      include: {
        wallet: { select: { vendor: { select: { shopName: true } } } },
        booking: { select: { id: true, finalPrice: true } }
      },
      orderBy: { createdAt: "desc" },
    });

    const totalCommission = commissionTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalCommission,
      transactions: commissionTransactions,
    };
  },

  // === QUẢN LÝ NGƯỜI DÙNG (ADMIN) ===
  getAllUsers: async (search?: string, role?: string, status?: string) => {
    return await prisma.user.findMany({
      where: {
        ...(role && { role: role as any }),
        ...(status && { status: status as any }),
        ...(search && {
          OR: [
            { email: { contains: search } },
            { firstName: { contains: search } },
            { lastName: { contains: search } },
          ],
        }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: { bookings: true, reviews: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
  },

  updateUserStatus: async (userId: number, status: string) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
    });
  },

  updateUserRole: async (userId: number, role: string, permissions: string[] | null) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { 
        role: role as any,
        permissions: permissions ? permissions : undefined
      },
    });
  },

  // === QUẢN LÝ SẢN PHẨM (ADMIN) ===
  getAllAdminHotels: async (search?: string, approvalStatus?: string, isActive?: boolean) => {
    return await prisma.hotel.findMany({
      where: {
        ...(approvalStatus && { approvalStatus: approvalStatus as any }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { city: { contains: search } },
          ]
        })
      },
      include: {
        vendor: { select: { shopName: true } },
        _count: { select: { rooms: true, reviews: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  toggleHotelActive: async (hotelId: number, isActive: boolean) => {
    return await prisma.hotel.update({
      where: { id: hotelId },
      data: { isActive }
    });
  },

  // === DASHBOARD (ADMIN) ===
  getAdminDashboardStats: async () => {
    const [totalUsers, totalVendors, totalHotels, totalBookings, commissionTransactions] = await Promise.all([
      prisma.user.count(),
      prisma.vendorProfile.count({ where: { status: VENDOR_STATUS.APPROVED } }),
      prisma.hotel.count({ where: { approvalStatus: APPROVAL_STATUS.APPROVED } }),
      prisma.booking.count(),
      prisma.walletTransaction.aggregate({
        where: { type: "COMMISSION_FEE" },
        _sum: { amount: true }
      })
    ]);

    return {
      totalUsers,
      totalVendors,
      totalHotels,
      totalBookings,
      totalRevenue: commissionTransactions._sum.amount || 0,
    };
  },

  // === DUYỆT YÊU CẦU RÚT TIỀN ===
  getWithdrawRequests: async (status?: string) => {
    return await prisma.withdrawRequest.findMany({
      where: status ? { status: status as any } : {},
      include: {
        vendor: {
          select: {
            shopName: true,
            bankName: true,
            bankAccount: true,
            bankOwner: true,
            user: { select: { email: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  approveWithdrawRequest: async (requestId: number) => {
    const request = await prisma.withdrawRequest.findUnique({
      where: { id: requestId },
      include: { wallet: true },
    });
    if (!request) throw new Error('Không tìm thấy yêu cầu rút tiền');
    if (request.status !== 'PENDING') throw new Error('Yêu cầu này đã được xử lý trước đó');
    if (request.wallet.balance < request.amount) throw new Error('Số dư ví không đủ để xử lý yêu cầu này');

    return await prisma.$transaction(async (tx) => {
      // Trừ balance thực sự
      await tx.wallet.update({
        where: { id: request.walletId },
        data: { balance: { decrement: request.amount } },
      });
      // Ghi transaction WITHDRAWAL
      await tx.walletTransaction.create({
        data: {
          walletId: request.walletId,
          type: 'WITHDRAWAL',
          amount: request.amount,
          description: `Rút tiền - YC #${requestId} - ${request.bankName} ${request.bankAccount}`,
        },
      });
      // Cập nhật trạng thái yêu cầu
      return await tx.withdrawRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', processedAt: new Date() },
      });
    });
  },

  rejectWithdrawRequest: async (requestId: number, adminNote?: string) => {
    const request = await prisma.withdrawRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error('Không tìm thấy yêu cầu rút tiền');
    if (request.status !== 'PENDING') throw new Error('Yêu cầu này đã được xử lý trước đó');

    return await prisma.withdrawRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', adminNote, processedAt: new Date() },
    });
  },
};
