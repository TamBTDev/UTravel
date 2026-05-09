import { bookingRepository } from '@/repositories/payment.repository';
import { roomRepository } from '@/repositories/room.repository';
import { userRepository } from '@/repositories/user.repository';
import { calculateNights, calculateTotalPrice } from '@/utils/helpers';

export class BookingService {
  async createBooking(userId: number, roomId: number, checkInDate: Date, checkOutDate: Date) {
    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify room exists and is available
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (!room.isAvailable) {
      throw new Error('Room is not available');
    }

    // Check if dates conflict with existing bookings
    const availableRooms = await roomRepository.findAvailable(room.hotelId, checkInDate, checkOutDate);
    const isAvailable = availableRooms.some((r) => r.id === roomId);

    if (!isAvailable) {
      throw new Error('Room is not available for selected dates');
    }

    // Calculate total price
    const nights = calculateNights(checkInDate, checkOutDate);
    const totalPrice = calculateTotalPrice(room.price, nights);

    return bookingRepository.create({
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
    });
  }

  async getUserBookings(userId: number, page: number = 1, limit: number = 10) {
    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const skip = (page - 1) * limit;
    const result = await bookingRepository.findByUserId(userId, skip, limit);

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

  async getAllBookings(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const result = await bookingRepository.findAll(skip, limit);

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

  async getBookingById(id: number) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  async cancelBooking(id: number) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    return bookingRepository.update(id, { status: 'cancelled' });
  }

  async confirmBooking(id: number) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    return bookingRepository.update(id, { status: 'confirmed' });
  }
}

export const bookingService = new BookingService();
