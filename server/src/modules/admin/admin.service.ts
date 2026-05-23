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
};
