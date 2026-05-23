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
};
