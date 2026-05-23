import { Request, Response } from 'express';
import prisma from '../../config/database';
import { PAYMENT_METHOD, PAYMENT_STATUS, BOOKING_STATUS } from '../../../../shared/constants/roles';

const getIdParam = (val: any): number => {
  if (Array.isArray(val)) return Number(val[0]);
  return Number(val);
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { bookingId, method } = req.body;

    if (!bookingId || !method) {
      return res.status(400).json({ message: 'Missing required fields: bookingId, method' });
    }

    const validMethods = Object.values(PAYMENT_METHOD);
    if (!validMethods.includes(method)) {
      return res.status(400).json({ message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}` });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized: This booking does not belong to you' });
    }

    const existingPayment = await prisma.payment.findFirst({
      where: { bookingId },
    });

    if (existingPayment && existingPayment.status === PAYMENT_STATUS.COMPLETED) {
      return res.status(400).json({ message: 'Payment already completed for this booking' });
    }

    const payment = await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount: booking.finalPrice,
        method,
        status: PAYMENT_STATUS.PENDING,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      update: {
        method,
        status: PAYMENT_STATUS.PENDING,
      },
    });

    res.status(201).json({ data: payment });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Failed to create payment', error: error.message });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const userId = (req as any).userId;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.booking.userId !== userId && (req as any).userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({ data: payment });
  } catch (error: any) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ message: 'Failed to fetch payment status', error: error.message });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const { status } = req.body;

    if ((req as any).userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized: Only admin can update payment status' });
    }

    const validStatuses = Object.values(PAYMENT_STATUS);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}` });
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
          paymentStatus: PAYMENT_STATUS.COMPLETED,
          status: BOOKING_STATUS.CONFIRMED,
        },
      });
    }

    res.status(200).json({ data: payment });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Failed to update payment status', error: error.message });
  }
};
