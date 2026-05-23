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
};
