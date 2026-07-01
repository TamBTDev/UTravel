import prisma from '../config/database';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../../../shared/constants/roles';

/**
 * Auto-complete bookings that have passed their checkout date.
 * Runs as a scheduled job (e.g. every hour).
 *
 * Logic:
 * - Tìm tất cả booking có status CONFIRMED và checkOutDate < now
 * - Gọi logic hoàn thành tương tự completeBooking:
 *   1. Update booking → COMPLETED
 *   2. Tặng 1% điểm thưởng
 *   3. Payout cho Vendor
 */
export const autoCompleteExpiredBookings = async (): Promise<void> => {
  const now = new Date();

  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: BOOKING_STATUS.CONFIRMED,
      checkOutDate: { lt: now },
    },
    include: {
      room: { include: { hotel: { include: { vendor: true } } } },
      payment: true,
    },
  });

  if (expiredBookings.length === 0) return;

  console.log(`[AutoComplete] Tìm thấy ${expiredBookings.length} booking quá hạn cần tự hoàn thành...`);

  for (const booking of expiredBookings) {
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Cập nhật booking → COMPLETED
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: BOOKING_STATUS.COMPLETED,
            paymentStatus: PAYMENT_STATUS.COMPLETED,
          },
        });

        // 2. Cập nhật payment nếu cần
        if (booking.payment && booking.payment.status !== 'COMPLETED') {
          await tx.payment.update({
            where: { id: booking.payment.id },
            data: { status: 'COMPLETED', paidAt: new Date() },
          });
        }

        // 3. Tặng 1% điểm thưởng cho khách
        const earnedPoints = Math.max(1, Math.floor(booking.finalPrice * 0.01));
        await tx.user.update({
          where: { id: booking.userId },
          data: { rewardPoints: { increment: earnedPoints } },
        });

        // 4. Tăng bookingCount cho hotel
        await tx.hotel.update({
          where: { id: booking.room.hotelId },
          data: { bookingCount: { increment: 1 } },
        });

        // 5. Payout cho Vendor
        const vendor = booking.room.hotel.vendor;
        if (!vendor) return;

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

        if (booking.payment && booking.payment.method === 'CASH') {
          // CASH: trừ hoa hồng từ ví vendor (vendor giữ tiền mặt)
          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: commissionFee } },
          });
          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              bookingId: booking.id,
              type: 'COMMISSION_FEE',
              amount: -commissionFee,
              description: `[Auto] Trừ phí hoa hồng (${commissionRate}%) cho đơn tiền mặt #${booking.id}`,
            },
          });
        } else {
          // BANK_TRANSFER / WALLET: sàn trả vendor sau khi trừ hoa hồng
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
                type: 'BOOKING_INCOME',
                amount: booking.finalPrice,
                description: `[Auto] Doanh thu từ đơn đặt phòng #${booking.id}`,
              },
              {
                walletId: wallet.id,
                bookingId: booking.id,
                type: 'COMMISSION_FEE',
                amount: -commissionFee,
                description: `[Auto] Phí hoa hồng sàn (${commissionRate}%) cho đơn #${booking.id}`,
              },
            ],
          });
        }
      });

      console.log(`[AutoComplete] ✅ Booking #${booking.id} đã được tự động hoàn thành.`);
    } catch (err: any) {
      console.error(`[AutoComplete] ❌ Lỗi khi xử lý booking #${booking.id}:`, err.message);
    }
  }

  console.log(`[AutoComplete] Hoàn tất xử lý ${expiredBookings.length} booking.`);
};

/**
 * Khởi động cron job tự động hoàn thành booking quá hạn.
 * Chạy mỗi giờ (3600000 ms).
 */
export const startBookingCronJob = (): void => {
  const INTERVAL_MS = 60 * 60 * 1000; // 1 giờ

  console.log('[AutoComplete] Cron job tự động hoàn thành booking đã khởi động (mỗi 1 giờ).');

  // Chạy ngay lần đầu khi server start
  autoCompleteExpiredBookings().catch(console.error);

  // Lên lịch chạy định kỳ
  setInterval(() => {
    autoCompleteExpiredBookings().catch(console.error);
  }, INTERVAL_MS);
};
