import { Request, Response } from 'express';
import prisma from '../../config/database';

// Helper: Safely extract ID from params
const getIdParam = (val: any): string => {
  if (Array.isArray(val)) return val[0];
  return val;
};

// ============ TASK 2.7: Create Payment ============
export const createPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { bookingId, method } = req.body;

    if (!bookingId || !method) {
      return res.status(400).json({ message: 'Missing required fields: bookingId, method' });
    }

    // Validate payment method
    const validMethods = ['credit_card', 'bank_transfer', 'momo', 'vnpay'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Find booking and verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized: This booking does not belong to you' });
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: { bookingId },
    });

    if (existingPayment && existingPayment.status === 'paid') {
      return res.status(400).json({ message: 'Payment already completed for this booking' });
    }

    // Create or update payment
    const payment = await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount: booking.totalPrice,
        method,
        status: 'pending',
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      update: {
        method,
        status: 'pending',
      },
    });

    res.status(201).json({ data: payment });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Failed to create payment', error: error.message });
  }
};

// ============ Optional: Get Payment Status ============
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

    // Check ownership
    if (payment.booking.userId !== userId && (req as any).userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({ data: payment });
  } catch (error: any) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ message: 'Failed to fetch payment status', error: error.message });
  }
};

// ============ Optional: Update Payment Status (For Admin or Webhook) ============
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const { status } = req.body;

    // This should ideally only be callable by admin or via webhook
    if ((req as any).userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized: Only admin can update payment status' });
    }

    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: { status },
      include: { booking: true },
    });

    // If payment is successful, update booking status to confirmed
    if (status === 'paid') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: 'paid', status: 'confirmed' },
      });
    }

    res.status(200).json({ data: payment });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Failed to update payment status', error: error.message });
  }
};
