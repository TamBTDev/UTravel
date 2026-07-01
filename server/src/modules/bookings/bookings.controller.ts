import { Request, Response } from "express";
import prisma from "../../config/database";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
} from "../../../../shared/constants/roles";
import { sendBookingNotification } from "../../services/email.service";
import { getIO } from "../../services/socket.service";

const getIdParam = (val: any): number => {
  if (Array.isArray(val)) return Number(val[0]);
  return Number(val);
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { checkInDate, checkOutDate, adults, children, specialNote } =
      req.body;
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
        throw new Error("Phòng đã được đặt trong khoảng thời gian này. Vui lòng chọn ngày khác.");
      }

      const nights = Math.ceil(
        (checkOutDt.getTime() - checkInDt.getTime()) / (1000 * 60 * 60 * 24),
      );
      const totalPrice = room.price * nights;
      const finalPrice = totalPrice;

      const booking = await tx.booking.create({
        data: {
          userId,
          roomId,
          checkInDate: checkInDt,
          checkOutDate: checkOutDt,
          adults: adults || 1,
          children: children || 0,
          specialNote: specialNote || null,
          totalPrice,
          finalPrice,
          status: BOOKING_STATUS.PENDING,
          paymentStatus: PAYMENT_STATUS.PENDING,
        },
        include: {
          room: { include: { hotel: true } },
        },
      });

      // Send Real-time Email Notification in background
      if (req.user && req.user.email) {
        sendBookingNotification(
          req.user.email,
          req.user.firstName || "Khách hàng",
          {
            hotelName: booking.room.hotel.name,
            roomType: booking.room.type,
            checkIn: checkInDt.toLocaleDateString("vi-VN"),
            checkOut: checkOutDt.toLocaleDateString("vi-VN"),
            totalPrice,
            bookingId: booking.id,
          },
        ).catch((err) => console.error("Error sending booking email:", err));
      }



      res.status(201).json({ data: booking });
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    res
      .status(400)
      .json({ message: error.message || "Failed to create booking", error: error.message });
  }
};

export const validatePromotion = async (req: Request, res: Response) => {
  try {
    const { code, hotelId } = req.query;
    if (!code)
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp mã khuyến mãi" });

    // Lấy vendorId của khách sạn để check xem promo này có phải của vendor đó ko
    // Nếu hotelId ko truyền thì bỏ qua bước check vendor (nhưng thực tế nên truyền để lấy đúng mã)
    let vendorId = null;
    if (hotelId) {
      const hotel = await prisma.hotel.findUnique({
        where: { id: Number(hotelId) },
      });
      if (hotel) vendorId = hotel.vendorId;
    }

    const promo = await prisma.promotion.findUnique({
      where: { code: String(code) },
    });
    if (!promo)
      return res.status(404).json({ message: "Mã khuyến mãi không tồn tại" });
    if (!promo.isActive)
      return res
        .status(400)
        .json({ message: "Mã khuyến mãi đã bị vô hiệu hóa" });
    if (new Date(promo.endDate) < new Date())
      return res.status(400).json({ message: "Mã khuyến mãi đã hết hạn" });
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit)
      return res
        .status(400)
        .json({ message: "Mã khuyến mãi đã hết lượt sử dụng" });
    if (vendorId && promo.vendorId !== vendorId)
      return res
        .status(400)
        .json({ message: "Mã khuyến mãi không áp dụng cho khách sạn này" });

    res.status(200).json({ data: promo });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
          message: `Không thể hủy đặt phòng có trạng thái "${booking.status}".`,
        });
      }

      const now = new Date();
      const checkIn = new Date(booking.checkInDate);
      const hoursUntilCheckIn =
        (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Nếu đã qua ngày check-in → không thể hủy, chỉ có thể hoàn thành
      if (now >= checkIn) {
        return res.status(400).json({
          message:
            "Không thể hủy đặt phòng sau ngày nhận phòng. Vui lòng xác nhận hoàn thành kỳ nghỉ.",
        });
      }

      // Nếu booking đã CONFIRMED và còn < 24h trước check-in → không được hủy
      if (
        booking.status === BOOKING_STATUS.CONFIRMED &&
        hoursUntilCheckIn < 24
      ) {
        return res.status(400).json({
          message: `Không thể hủy đặt phòng trong vòng 24 giờ trước ngày nhận phòng (${Math.floor(hoursUntilCheckIn)} giờ còn lại). Liên hệ hỗ trợ nếu cần trợ giúp.`,
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
          booking.payment.method === "BANK_TRANSFER" &&
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
              type: "REFUND",
              amount: refundAmount,
              description: `Hoàn tiền đặt phòng #${id} tại ${booking.room.hotel.name}`,
            },
          });

          return res.status(200).json({
            success: true,
            message: `Hủy đặt phòng thành công. ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(refundAmount)} đã được hoàn vào ví UTravel của bạn.`,
            refunded: true,
            refundAmount,
            data: updated,
          });
        }

        // Không hoàn tiền (CASH hoặc chưa thanh toán)
        return res.status(200).json({
          success: true,
          message: "Hủy đặt phòng thành công.",
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

    if (
      status === BOOKING_STATUS.COMPLETED &&
      booking.status !== BOOKING_STATUS.COMPLETED
    ) {
      await prisma.hotel.update({
        where: { id: booking.room.hotelId },
        data: { bookingCount: { increment: 1 } },
      });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating booking:", error);
    res
      .status(500)
      .json({ message: "Lỗi cập nhật đặt phòng", error: error.message });
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

    if (booking.userId !== userId && (req as any).user?.role !== "ADMIN") {
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

export const completeBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const userId = (req as any).user?.id;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: { include: { hotel: { include: { vendor: true } } } },
        payment: true,
      },
    });

    if (!booking)
      return res.status(404).json({ message: "Booking không tồn tại" });
    if (booking.userId !== userId && (req as any).user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Không có quyền thao tác" });
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      return res
        .status(400)
        .json({
          message:
            "Chỉ có thể hoàn thành đơn hàng ở trạng thái Đã xác nhận (CONFIRMED)",
        });
    }

    const payment = booking.payment;
    if (
      payment &&
      payment.method !== "CASH" &&
      payment.status !== "COMPLETED"
    ) {
      return res
        .status(400)
        .json({
          message: "Đơn hàng chưa được thanh toán, không thể hoàn thành.",
        });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Cập nhật booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BOOKING_STATUS.COMPLETED,
        },
      });

      // 2. Xử lý theo phương thức thanh toán
      const payment = booking.payment;

      if (payment && payment.method === "CASH") {
        // CASH: đánh dấu COMPLETED nếu chưa (trường hợp vendor chưa update)
        if (payment.status !== "COMPLETED") {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "COMPLETED", paidAt: new Date() },
          });
        }
        await tx.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: PAYMENT_STATUS.COMPLETED },
        });
      } else if (payment && payment.status === "COMPLETED") {
        // BANK_TRANSFER / WALLET đã thanh toán → cập nhật paymentStatus booking
        await tx.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: PAYMENT_STATUS.COMPLETED },
        });
      } else if (!payment) {
        // Không có payment record (edge case) — bỏ qua, vẫn cho complete
        console.warn(
          `[completeBooking] Booking #${bookingId} không có payment record`,
        );
      }

      // ── Tặng 1% điểm thưởng khi hoàn thành kỳ nghỉ (mọi phương thức thanh toán) ──
      const earnedPoints = Math.max(1, Math.floor(booking.finalPrice * 0.01));
      await tx.user.update({
        where: { id: booking.userId },
        data: { rewardPoints: { increment: earnedPoints } },
      });
      console.log(`[completeBooking] Tặng ${earnedPoints} điểm cho user #${booking.userId} từ booking #${bookingId}`);

      // 3. Tăng bookingCount cho hotel
      await tx.hotel.update({
        where: { id: booking.room.hotelId },
        data: { bookingCount: { increment: 1 } },
      });

      // 4. Payout cho Vendor
      const vendor = booking.room.hotel.vendor;
      if (!vendor) return; // Nếu không có vendor, bỏ qua payout

      const commissionRate = vendor.commissionRate || 10;
      const commissionFee = (booking.finalPrice * commissionRate) / 100;

      let wallet = await tx.wallet.findUnique({
        where: { vendorId: vendor.id },
      });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { vendorId: vendor.id, balance: 0 },
        });
      }

      if (payment && payment.method === "CASH") {
        // CASH: Vendor đã nhận toàn bộ tiền mặt từ khách
        // Do đó, ví ảo của vendor sẽ bị trừ tiền hoa hồng thay vì cộng doanh thu
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: commissionFee } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            bookingId: booking.id,
            type: "COMMISSION_FEE",
            amount: -commissionFee,
            description: `Trừ phí hoa hồng sàn (${commissionRate}%) cho đơn tiền mặt #${booking.id}`,
          },
        });
      } else {
        // BANK_TRANSFER hoặc các hình thức khác: Sàn giữ tiền
        // Sàn trả cho vendor doanh thu sau khi trừ hoa hồng
        const netIncome = booking.finalPrice - commissionFee;

        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: netIncome } },
        });

        await tx.walletTransaction.createMany({
          data: [
            {
              walletId: wallet.id,
              bookingId: booking.id,
              type: "BOOKING_INCOME",
              amount: booking.finalPrice,
              description: `Doanh thu từ đơn đặt phòng #${booking.id}`,
            },
            {
              walletId: wallet.id,
              bookingId: booking.id,
              type: "COMMISSION_FEE",
              amount: -commissionFee,
              description: `Phí hoa hồng sàn (${commissionRate}%) cho đơn #${booking.id}`,
            },
          ],
        });
      }
    });

    res
      .status(200)
      .json({ success: true, message: "Hoàn thành kỳ nghỉ thành công" });
  } catch (error: any) {
    console.error("Error completing booking:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi hoàn thành kỳ nghỉ", error: error.message });
  }
};
