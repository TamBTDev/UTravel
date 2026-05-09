import { paymentRepository } from '@/repositories/review.repository';
import { bookingRepository } from '@/repositories/payment.repository';

export class PaymentService {
  async createPayment(bookingId: number, method: string) {
    // Verify booking exists
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.payment) {
      throw new Error('Payment already exists for this booking');
    }

    return paymentRepository.create({
      bookingId,
      amount: booking.totalPrice,
      method,
    });
  }

  async completePayment(id: number) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Update payment status
    const updatedPayment = await paymentRepository.update(id, { status: 'completed' });

    // Update booking payment status
    await bookingRepository.update(payment.bookingId, { paymentStatus: 'paid' });

    return updatedPayment;
  }

  async failPayment(id: number) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new Error('Payment not found');
    }

    return paymentRepository.update(id, { status: 'failed' });
  }

  async getPaymentsByBooking(bookingId: number) {
    return paymentRepository.findByBookingId(bookingId);
  }

  async getAllPayments(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const result = await paymentRepository.findAll(skip, limit);

    return {
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}

export const paymentService = new PaymentService();
