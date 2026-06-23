import { Request, Response } from 'express';
import prisma from '../../config/database';
import { PAYMENT_METHOD, PAYMENT_STATUS, BOOKING_STATUS } from '../../../../shared/constants/roles';
import env from '../../config/env';

const getIdParam = (val: any): number => {
  if (Array.isArray(val)) return Number(val[0]);
  return Number(val);
};

/**
 * Tạo nội dung chuyển khoản duy nhất theo bookingId
 */
const buildTransferContent = (bookingId: number): string => {
  return `UTRAVEL${bookingId}`;
};

/**
 * Tạo URL QR code SePay
 * https://qr.sepay.vn/img?acc=STK&bank=BANKCODE&amount=AMOUNT&des=NOIDUNG&template=compact
 */
const buildSePayQrUrl = (amount: number, transferContent: string): string => {
  // Strip angle brackets that may have been accidentally included in env values
  const accountNumber = (env.SEPAY_ACCOUNT_NUMBER || '').replace(/[<>]/g, '').trim();
  const bankCode = (env.SEPAY_BANK_CODE || 'MB').replace(/[<>]/g, '').trim();

  const params = new URLSearchParams({
    acc: accountNumber,
    bank: bankCode,
    amount: Math.round(amount).toString(),
    des: transferContent,
    template: 'compact',
  });
  return `https://qr.sepay.vn/img?${params.toString()}`;
};

/**
 * POST /payments — Tạo payment cho booking
 * Hỗ trợ CASH và BANK_TRANSFER
 */
export const createPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { bookingId, method, promotionCode, usePoints, useWallet } = req.body;

    if (!bookingId || !method) {
      return res.status(400).json({ success: false, message: 'Thiếu bookingId hoặc phương thức thanh toán' });
    }

    if (!['CASH', 'BANK_TRANSFER', 'WALLET'].includes(method)) {
      return res.status(400).json({ success: false, message: 'Phương thức thanh toán không hợp lệ' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: Number(bookingId) },
        include: { payment: true, room: { include: { hotel: true } } },
      });

      if (!booking) throw new Error('Không tìm thấy đặt phòng');
      if (booking.userId !== userId) throw new Error('Không có quyền thực hiện thao tác này');
      if (booking.payment && booking.payment.status === PAYMENT_STATUS.COMPLETED) {
        throw new Error('Đặt phòng này đã được thanh toán');
      }

      let discountAmount = 0;
      let promotionId = null;

      if (promotionCode) {
        const promo = await tx.promotion.findUnique({ where: { code: promotionCode } });
        if (!promo || !promo.isActive) throw new Error("Mã khuyến mãi không hợp lệ hoặc đã bị vô hiệu hóa");
        if (new Date() < promo.startDate || new Date() > promo.endDate) throw new Error("Mã khuyến mãi không trong thời gian có hiệu lực");
        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) throw new Error("Mã khuyến mãi đã hết lượt sử dụng");
        if (booking.totalPrice < promo.minOrderValue) throw new Error(`Đơn hàng phải tối thiểu ${promo.minOrderValue} VND`);

        if (promo.discountType === 'percentage') {
          discountAmount = (booking.totalPrice * promo.discountValue) / 100;
          if (promo.maxDiscount && discountAmount > promo.maxDiscount) discountAmount = promo.maxDiscount;
        } else {
          discountAmount = promo.discountValue;
        }
        promotionId = promo.id;

        await tx.promotion.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });
      }

      let pointsUsed = 0;
      let pointsDiscount = 0;
      if (usePoints && usePoints > 0) {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user || user.rewardPoints < usePoints) throw new Error('Không đủ điểm thưởng');
        
        pointsUsed = usePoints;
        pointsDiscount = pointsUsed;

        if (pointsDiscount > (booking.totalPrice - discountAmount)) {
          pointsDiscount = booking.totalPrice - discountAmount;
          pointsUsed = Math.floor(pointsDiscount);
        }

        await tx.user.update({ where: { id: userId }, data: { rewardPoints: { decrement: pointsUsed } } });
      }

      const finalPrice = Math.max(0, booking.totalPrice - discountAmount - pointsDiscount);

      let walletAmount = 0;
      if (useWallet) {
        const wallet = await tx.userWallet.findUnique({ where: { userId } });
        if (wallet && wallet.balance > 0) {
          walletAmount = Math.min(wallet.balance, finalPrice);
          if (walletAmount > 0) {
            await tx.userWallet.update({ where: { userId }, data: { balance: { decrement: walletAmount } } });
            await tx.userWalletTransaction.create({
              data: {
                walletId: wallet.id,
                bookingId: Number(bookingId),
                type: 'WITHDRAW',
                amount: walletAmount,
                description: `Thanh toán đặt phòng #${bookingId} bằng Ví UTravel`,
              },
            });
          }
        }
      }

      const remainingAmount = Math.max(0, finalPrice - walletAmount);

      const updatedBooking = await tx.booking.update({
        where: { id: Number(bookingId) },
        data: {
          promotionId,
          discountAmount,
          pointsUsed,
          pointsDiscount,
          finalPrice,
          status: remainingAmount === 0 ? BOOKING_STATUS.CONFIRMED : booking.status,
          paymentStatus: remainingAmount === 0 ? PAYMENT_STATUS.COMPLETED : booking.paymentStatus,
        }
      });

      if (remainingAmount === 0) {
        const payment = await tx.payment.upsert({
          where: { bookingId: Number(bookingId) },
          create: {
            bookingId: Number(bookingId),
            amount: finalPrice,
            method: 'WALLET',
            status: 'COMPLETED',
            paidAt: new Date(),
            transactionId: `WALLET_${Date.now()}`,
          },
          update: { method: 'WALLET', status: 'COMPLETED', paidAt: new Date() },
        });

        // Tặng điểm thưởng 1%
        const earnedPoints = Math.max(1, Math.floor(finalPrice * 0.01));
        await tx.user.update({ where: { id: userId }, data: { rewardPoints: { increment: earnedPoints } } });

        return { success: true, method: 'WALLET', payment, remainingAmount: 0 };
      }

      const transferContent = buildTransferContent(Number(bookingId));

      if (method === PAYMENT_METHOD.CASH) {
        // CASH: booking giữ nguyên trạng thái PENDING
        // Vendor phải bấm "Xác nhận nhận phòng" trước, sau đó khách mới có thể hoàn thành
        const payment = await tx.payment.upsert({
          where: { bookingId: Number(bookingId) },
          create: {
            bookingId: Number(bookingId),
            amount: remainingAmount,
            method: 'CASH',
            status: 'PENDING',
            transactionId: `CASH_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          },
          update: { method: 'CASH', status: 'PENDING', amount: remainingAmount },
        });
        return { success: true, method: 'CASH', payment, remainingAmount };
      }

      if (method === PAYMENT_METHOD.BANK_TRANSFER) {
        const qrCodeUrl = buildSePayQrUrl(remainingAmount, transferContent);
        const payment = await tx.payment.upsert({
          where: { bookingId: Number(bookingId) },
          create: {
            bookingId: Number(bookingId),
            amount: remainingAmount,
            method: 'BANK_TRANSFER',
            status: 'PENDING',
            transactionId: `BANK_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            transferContent,  // Lưu nội dung chuyển khoản để match với SePay
          },
          update: {
            method: 'BANK_TRANSFER',
            status: 'PENDING',
            amount: remainingAmount,
            transferContent,  // Cập nhật transferContent nếu đã tồn tại
          },
        });
        
        const bankInfo = {
          bankCode: (env.SEPAY_BANK_CODE || 'MB').replace(/[<>]/g, '').trim(),
          accountNumber: (env.SEPAY_ACCOUNT_NUMBER || '').replace(/[<>]/g, '').trim(),
          accountName: (env.SEPAY_ACCOUNT_NAME || 'UTRAVEL').replace(/[<>]/g, '').trim(),
          amount: remainingAmount,
          transferContent,
          qrCodeUrl,
        };

        return { success: true, method: 'BANK_TRANSFER', payment, bankInfo, remainingAmount };
      }

      throw new Error('Phương thức không hợp lệ ở bước cuối');
    });

    if (result.method === 'WALLET') {
      return res.status(201).json({
        success: true,
        message: 'Thanh toán thành công toàn bộ!',
        data: result.payment,
      });
    }

    if (result.method === 'CASH') {
      return res.status(201).json({
        success: true,
        message: 'Đặt phòng thành công! Vui lòng thanh toán tiền mặt khi đến nhận phòng.',
        data: result.payment,
      });
    }

    if (result.method === 'BANK_TRANSFER') {
      return res.status(201).json({
        success: true,
        message: 'Vui lòng thanh toán qua mã QR.',
        data: { payment: result.payment, bankInfo: result.bankInfo },
      });
    }

  } catch (error: any) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: error.message || 'Có lỗi xảy ra khi tạo thanh toán' });
  }
};

/**
 * GET /payments/wallet/balance — Lấy số dư ví của user
 */
export const getUserWalletBalance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const wallet = await prisma.userWallet.findUnique({
      where: { userId },
      select: { id: true, balance: true, updatedAt: true },
    });
    return res.status(200).json({
      success: true,
      data: { balance: wallet?.balance ?? 0, hasWallet: !!wallet },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi lấy số dư ví', error: error.message });
  }
};

/**
 * GET /payments/booking/:bookingId — Polling: Kiểm tra trạng thái thanh toán theo booking
 * Frontend gọi mỗi 5 giây để check
 */
export const getPaymentByBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = getIdParam(req.params.bookingId);
    const userId = (req as any).user?.id;

    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          select: { userId: true, status: true, finalPrice: true },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Chưa có thông tin thanh toán' });
    }

    if (payment.booking.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    // --- SEPAY API POLLING LOGIC ---
    if (payment.status === 'PENDING' && payment.method === 'BANK_TRANSFER') {
      try {
        const token = env.SEPAY_API_TOKEN;
        if (token) {
          const sepayRes = await fetch('https://my.sepay.vn/userapi/transactions/list', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (sepayRes.ok) {
            const data: any = await sepayRes.json();
            if (data && data.transactions && Array.isArray(data.transactions)) {
              // Match theo transferContent (UTRAVEL{bookingId}) - đây là nội dung
              // khách ghi khi chuyển khoản, SePay trả về trong transaction_content
              const expectedContent = payment.transferContent || buildTransferContent(payment.bookingId);
              
              const matchedTx = data.transactions.find((tx: any) => 
                tx.transaction_content && 
                tx.transaction_content.toUpperCase().includes(expectedContent.toUpperCase())
              );

              if (matchedTx) {
                // Khớp giao dịch -> Cập nhật trạng thái
                await prisma.$transaction(async (tx) => {
                  await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                      status: 'COMPLETED',
                      paidAt: new Date(matchedTx.transaction_date || new Date()),
                    },
                  });

                  await tx.booking.update({
                    where: { id: payment.bookingId },
                    data: {
                      paymentStatus: 'COMPLETED',
                      status: 'CONFIRMED',
                    },
                  });

                  // Tặng điểm thưởng 1% giá trị hóa đơn (tối thiểu 1 điểm)
                  const earnedPoints = Math.max(1, Math.floor(payment.booking.finalPrice * 0.01));
                  await tx.user.update({
                    where: { id: payment.booking.userId },
                    data: { rewardPoints: { increment: earnedPoints } }
                  });
                });
                
                // Cập nhật lại bộ nhớ để trả về client luôn
                payment.status = 'COMPLETED';
                payment.paidAt = new Date(matchedTx.transaction_date || new Date());
                payment.booking.status = 'CONFIRMED';
                console.log(`[SEPAY_API] Đã tìm thấy giao dịch chuyển khoản cho booking #${payment.bookingId}`);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error polling Sepay API:', err);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        id: payment.id,
        bookingId: payment.bookingId,
        status: payment.status,
        method: payment.method,
        amount: payment.amount,
        paidAt: payment.paidAt,
        bookingStatus: payment.booking.status,
      },
    });
  } catch (error: any) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ success: false, message: 'Lỗi kiểm tra trạng thái', error: error.message });
  }
};

/**
 * GET /payments/:id — Lấy chi tiết payment
 */
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const userId = (req as any).user?.id;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán' });
    }

    if (payment.booking.userId !== userId && (req as any).user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error: any) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy trạng thái thanh toán', error: error.message });
  }
};

/**
 * POST /payments/sepay-webhook — SePay gửi webhook xác nhận giao dịch thành công
 * Hoạt động trong production (có URL public)
 * Trong dev: dùng polling thay thế
 */
export const sePayWebhook = async (req: Request, res: Response) => {
  try {
    const { content, transferAmount, referenceCode } = req.body;

    // SePay gửi về nội dung chuyển khoản, tìm payment theo transferContent
    const transferContent = content || referenceCode || '';

    if (!transferContent.startsWith('UTRAVEL')) {
      // Không phải giao dịch của UTravel, bỏ qua
      return res.status(200).json({ success: true, message: 'Bỏ qua giao dịch không liên quan' });
    }

    const payment = await prisma.payment.findFirst({
      where: { transferContent },  // Match theo nội dung chuyển khoản UTRAVEL{bookingId}
      include: { booking: true },
    });

    if (!payment) {
      // Thử fallback: tìm theo bookingId extract từ transferContent (UTRAVEL{id})
      const match = transferContent.match(/UTRAVEL(\d+)/i);
      if (match) {
        const bookingId = Number(match[1]);
        const paymentByBooking = await prisma.payment.findUnique({
          where: { bookingId },
          include: { booking: true },
        });
        if (paymentByBooking && paymentByBooking.status !== PAYMENT_STATUS.COMPLETED) {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: paymentByBooking.id },
              data: { status: 'COMPLETED', paidAt: new Date(), transferContent },
            });
            await tx.booking.update({
              where: { id: paymentByBooking.bookingId },
              data: { paymentStatus: 'COMPLETED', status: 'CONFIRMED' },
            });
          });
          console.log(`[SEPAY_WEBHOOK] Fallback match: booking #${bookingId}, content=${transferContent}`);
          return res.status(200).json({ success: true, message: 'Xác nhận thanh toán thành công (fallback)' });
        }
      }
      console.warn('[SEPAY_WEBHOOK] Không tìm thấy payment với transferContent:', transferContent);
      return res.status(200).json({ success: true, message: 'Không tìm thấy payment' });
    }

    if (payment.status === PAYMENT_STATUS.COMPLETED) {
      return res.status(200).json({ success: true, message: 'Đã xử lý trước đó' });
    }

    // Cập nhật payment COMPLETED + booking CONFIRMED trong transaction
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });

      await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED',
        },
      });
    });

    console.log(`[SEPAY_WEBHOOK] Xác nhận thanh toán thành công: ${transferContent}, booking #${payment.bookingId}`);
    return res.status(200).json({ success: true, message: 'Xác nhận thanh toán thành công' });
  } catch (error: any) {
    console.error('[SEPAY_WEBHOOK] Error:', error);
    // Trả 200 để SePay không retry
    return res.status(200).json({ success: false, message: 'Lỗi xử lý webhook' });
  }
};

/**
 * PATCH /payments/:id — Admin cập nhật trạng thái payment (dùng cho dev/testing)
 */
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const { status } = req.body;

    if ((req as any).user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Chỉ Admin mới được cập nhật trạng thái' });
    }

    const validStatuses = Object.values(PAYMENT_STATUS);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Phải là: ${validStatuses.join(', ')}`,
      });
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: { status },
      include: { booking: true },
    });

    if (status === PAYMENT_STATUS.COMPLETED) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED',
        },
      });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái', error: error.message });
  }
};
