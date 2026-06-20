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
    const { bookingId, method } = req.body;

    if (!bookingId || !method) {
      return res.status(400).json({ success: false, message: 'Thiếu bookingId hoặc phương thức thanh toán' });
    }

    // Chỉ chấp nhận CASH và BANK_TRANSFER
    if (method !== PAYMENT_METHOD.CASH && method !== PAYMENT_METHOD.BANK_TRANSFER) {
      return res.status(400).json({
        success: false,
        message: 'Phương thức thanh toán không hợp lệ. Chỉ chấp nhận CASH hoặc BANK_TRANSFER',
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: { payment: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đặt phòng' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Không có quyền thực hiện thao tác này' });
    }

    // Nếu đã có payment COMPLETED thì từ chối
    if (booking.payment && booking.payment.status === PAYMENT_STATUS.COMPLETED) {
      return res.status(400).json({ success: false, message: 'Đặt phòng này đã được thanh toán' });
    }

    const transferContent = buildTransferContent(Number(bookingId));

    // ── CASH: Đặt phòng trước, trả tiền mặt khi nhận phòng ──
    if (method === PAYMENT_METHOD.CASH) {
      const payment = await prisma.payment.upsert({
        where: { bookingId: Number(bookingId) },
        create: {
          bookingId: Number(bookingId),
          amount: booking.finalPrice,
          method: 'CASH',
          status: 'PENDING',
          transactionId: `CASH_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        },
        update: {
          method: 'CASH',
          status: 'PENDING',
        },
      });

      return res.status(201).json({
        success: true,
        method: 'CASH',
        message: 'Đặt phòng thành công! Vui lòng thanh toán tiền mặt khi đến nhận phòng.',
        data: payment,
      });
    }

    // ── BANK_TRANSFER: Tạo QR SePay ──
    const qrCodeUrl = buildSePayQrUrl(booking.finalPrice, transferContent);

    const payment = await prisma.payment.upsert({
      where: { bookingId: Number(bookingId) },
      create: {
        bookingId: Number(bookingId),
        amount: booking.finalPrice,
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        transactionId: transferContent,
      },
      update: {
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        transactionId: transferContent,
      },
    });

    return res.status(201).json({
      success: true,
      method: 'BANK_TRANSFER',
      message: 'Vui lòng quét mã QR hoặc chuyển khoản theo thông tin bên dưới',
      data: {
        payment,
        bankInfo: {
          bankCode: (env.SEPAY_BANK_CODE || 'MB').replace(/[<>]/g, '').trim(),
          accountNumber: (env.SEPAY_ACCOUNT_NUMBER || '').replace(/[<>]/g, '').trim(),
          accountName: (env.SEPAY_ACCOUNT_NAME || 'CONG TY UTRAVEL').replace(/[<>]/g, '').trim(),
          amount: booking.finalPrice,
          transferContent,
          qrCodeUrl,
        },
      },
    });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo thanh toán', error: error.message });
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
            if (data && data.transactions && Array.isArray(data.transactions) && payment.transactionId) {
              const matchedTx = data.transactions.find((tx: any) => 
                tx.transaction_content && 
                tx.transaction_content.toUpperCase().includes(payment.transactionId!.toUpperCase())
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
      where: { transactionId: transferContent },
      include: { booking: true },
    });

    if (!payment) {
      console.warn('[SEPAY_WEBHOOK] Không tìm thấy payment với transactionId:', transferContent);
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
