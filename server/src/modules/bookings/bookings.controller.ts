import { Request, Response } from "express";
import prisma from "../../config/database";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
} from "../../../../shared/constants/roles";

const getIdParam = (val: any): number => {
  if (Array.isArray(val)) return Number(val[0]);
  return Number(val);
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { checkInDate, checkOutDate, adults, children, specialNote } = req.body;
    const roomId = Number(req.body.roomId);

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        message: "Missing required fields: roomId, checkInDate, checkOutDate",
      });
    }

    if (isNaN(roomId)) {
      return res.status(400).json({ message: "roomId must be a valid number" });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const checkInDt = new Date(checkInDate);
    const checkOutDt = new Date(checkOutDate);

    if (checkInDt >= checkOutDt) {
      return res
        .status(400)
        .json({ message: "Check-out date must be after check-in date" });
    }

    const { promotionCode, usePoints } = req.body;

    return await prisma.$transaction(async (tx) => {
      const conflictingBookings = await tx.booking.findMany({
        where: {
          roomId,
          status: { not: BOOKING_STATUS.CANCELLED },
          checkInDate: { lt: checkOutDt },
          checkOutDate: { gt: checkInDt },
        },
      });

      if (conflictingBookings.length > 0) {
        throw new Error("Room is not available for the selected dates");
      }

      const nights = Math.ceil(
        (checkOutDt.getTime() - checkInDt.getTime()) / (1000 * 60 * 60 * 24),
      );
      const totalPrice = room.price * nights;
      
      let discountAmount = 0;
      let promotionId = null;

      if (promotionCode) {
        const promo = await tx.promotion.findUnique({ where: { code: promotionCode } });
        if (promo && promo.isActive && new Date(promo.endDate) > new Date() && promo.usedCount < (promo.usageLimit || Infinity)) {
           if (totalPrice >= promo.minOrderValue) {
              promotionId = promo.id;
              if (promo.discountType === 'percentage') {
                 discountAmount = (totalPrice * promo.discountValue) / 100;
                 if (promo.maxDiscount && discountAmount > promo.maxDiscount) discountAmount = promo.maxDiscount;
              } else {
                 discountAmount = promo.discountValue;
              }
              await tx.promotion.update({
                 where: { id: promo.id },
                 data: { usedCount: { increment: 1 } }
              });
           }
        }
      }

      let pointsUsed = 0;
      let pointsDiscount = 0;
      if (usePoints) {
         const user = await tx.user.findUnique({ where: { id: userId } });
         if (user && user.rewardPoints > 0) {
             const pointsToUse = Math.min(usePoints, user.rewardPoints);
             pointsUsed = pointsToUse;
             pointsDiscount = pointsToUse * 1000; // 1 điểm = 1000 VND discount
             
             // Không giảm quá giá trị đơn hàng
             if (pointsDiscount > (totalPrice - discountAmount)) {
                 pointsDiscount = totalPrice - discountAmount;
                 pointsUsed = Math.floor(pointsDiscount / 1000);
             }

             await tx.user.update({
                 where: { id: userId },
                 data: { rewardPoints: { decrement: pointsUsed } }
             });
         }
      }

      const finalPrice = Math.max(0, totalPrice - discountAmount - pointsDiscount);

      const booking = await tx.booking.create({
        data: {
          userId,
          roomId,
          promotionId,
          checkInDate: checkInDt,
          checkOutDate: checkOutDt,
          adults: adults || 1,
          children: children || 0,
          specialNote: specialNote || null,
          totalPrice,
          discountAmount,
          pointsUsed,
          pointsDiscount,
          finalPrice,
          status: BOOKING_STATUS.PENDING,
          paymentStatus: PAYMENT_STATUS.PENDING,
        },
        include: {
          room: { include: { hotel: true } },
        },
      });

      res.status(201).json({ data: booking });
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    res
      .status(500)
      .json({ message: "Failed to create booking", error: error.message });
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        room: { include: { hotel: true } },
        payment: true,
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ data: bookings });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch bookings", error: error.message });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const { status } = req.body;
    const userId = (req as any).user?.id;

    const validStatuses = Object.values(BOOKING_STATUS);
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Trạng thái không hợp lệ. Phải là: ${validStatuses.join(", ")}`,
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: { include: { hotel: true } },
        payment: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy đặt phòng" });
    }

    if (booking.userId !== userId && (req as any).user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Không có quyền thực hiện" });
    }

    // ── Logic hủy booking ──
    if (status === BOOKING_STATUS.CANCELLED) {
      // Chỉ cho hủy khi booking đang PENDING hoặc CONFIRMED
      if (
        booking.status !== BOOKING_STATUS.PENDING &&
        booking.status !== BOOKING_STATUS.CONFIRMED
      ) {
        return res.status(400).json({
          message: `Không thể hủy đặt phòng có trạng thái "${booking.status}". Chỉ được hủy khi đang PENDING hoặc CONFIRMED.`,
        });
      }

      return await prisma.$transaction(async (tx) => {
        // Cập nhật trạng thái booking
        const updated = await tx.booking.update({
          where: { id },
          data: {
            status: BOOKING_STATUS.CANCELLED,
            paymentStatus:
              booking.payment?.status === PAYMENT_STATUS.COMPLETED
                ? PAYMENT_STATUS.REFUNDED
                : booking.paymentStatus,
          },
          include: {
            room: { include: { hotel: true } },
            payment: true,
          },
        });

        // ── Hoàn tiền vào ví nếu đã TT qua BANK_TRANSFER và payment COMPLETED ──
        if (
          booking.payment &&
          booking.payment.method === 'BANK_TRANSFER' &&
          booking.payment.status === PAYMENT_STATUS.COMPLETED
        ) {
          const refundAmount = booking.finalPrice;

          // Cập nhật payment thành REFUNDED
          await tx.payment.update({
            where: { id: booking.payment.id },
            data: { status: PAYMENT_STATUS.REFUNDED },
          });

          // Lấy hoặc tạo UserWallet
          const wallet = await tx.userWallet.upsert({
            where: { userId: booking.userId },
            create: { userId: booking.userId, balance: refundAmount },
            update: { balance: { increment: refundAmount } },
          });

          // Ghi lịch sử giao dịch hoàn tiền
          await tx.userWalletTransaction.create({
            data: {
              walletId: wallet.id,
              bookingId: id,
              type: 'REFUND',
              amount: refundAmount,
              description: `Hoàn tiền đặt phòng #${id} tại ${booking.room.hotel.name}`,
            },
          });

          return res.status(200).json({
            success: true,
            message: `Hủy đặt phòng thành công. ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(refundAmount)} đã được hoàn vào ví UTravel của bạn.`,
            refunded: true,
            refundAmount,
            data: updated,
          });
        }

        // Không hoàn tiền (CASH hoặc chưa thanh toán)
        return res.status(200).json({
          success: true,
          message: 'Hủy đặt phòng thành công.',
          refunded: false,
          data: updated,
        });
      });
    }

    // ── Cập nhật trạng thái khác (COMPLETED, CONFIRMED) — Admin only ──
    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        room: { include: { hotel: true } },
        payment: true,
      },
    });

    if (status === BOOKING_STATUS.COMPLETED && booking.status !== BOOKING_STATUS.COMPLETED) {
      await prisma.hotel.update({
        where: { id: booking.room.hotelId },
        data: { bookingCount: { increment: 1 } },
      });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Lỗi cập nhật đặt phòng", error: error.message });
  }
};

export const getBookingDetail = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const userId = (req as any).user?.id;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: { include: { hotel: true } },
        payment: true,
        review: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId !== userId && (req as any).user?.role !== 'ADMIN') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({ data: booking });
  } catch (error: any) {
    console.error("Error fetching booking detail:", error);
    res.status(500).json({
      message: "Failed to fetch booking detail",
      error: error.message,
    });
  }
};
