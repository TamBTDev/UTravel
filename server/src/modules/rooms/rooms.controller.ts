import { Request, Response } from 'express';
import prisma from '../../config/database';
import { BOOKING_STATUS } from '../../../../shared/constants/roles';

const getIdParam = (val: any): number => {
  if (Array.isArray(val)) return Number(val[0]);
  return Number(val);
};

const getQueryString = (val: any): string | null => {
  if (Array.isArray(val)) return val[0] || null;
  return val || null;
};

export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const roomId = getIdParam(req.params.roomId);
    const checkInDate = getQueryString(req.query.checkInDate);
    const checkOutDate = getQueryString(req.query.checkOutDate);

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Missing checkInDate or checkOutDate' });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { bookings: true },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const checkInDateTime = new Date(checkInDate);
    const checkOutDateTime = new Date(checkOutDate);

    const conflictingBookings = room.bookings.filter((booking) => {
      const bookingStart = new Date(booking.checkInDate);
      const bookingEnd = new Date(booking.checkOutDate);

      if (booking.status === BOOKING_STATUS.CANCELLED) {
        return false;
      }

      return bookingStart < checkOutDateTime && bookingEnd > checkInDateTime;
    });

    const isAvailable = conflictingBookings.length === 0;

    res.status(200).json({
      data: {
        roomId,
        isAvailable,
        availableCount: isAvailable ? 1 : 0,
        conflictingBookings: conflictingBookings.length,
      },
    });
  } catch (error: any) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Failed to check availability', error: error.message });
  }
};

export const getRoomDetail = async (req: Request, res: Response) => {
  try {
    const roomId = getIdParam(req.params.roomId);

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        hotel: true,
        bookings: {
          where: { status: { not: BOOKING_STATUS.CANCELLED } },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ data: room });
  } catch (error: any) {
    console.error('Error fetching room detail:', error);
    res.status(500).json({ message: 'Failed to fetch room detail', error: error.message });
  }
};

/**
 * GET /rooms/:roomId/booked-dates
 * Trả về danh sách các khoảng ngày đã bị đặt cho phòng này.
 * - Chỉ tính PENDING và CONFIRMED (không tính COMPLETED vì phòng đã được trả)
 * - Khi khách hoàn thành sớm → booking chuyển COMPLETED → phòng tự giải phóng
 * - Thêm 1 ngày buffer dọn phòng vào cuối mỗi booking
 */
export const getBookedDates = async (req: Request, res: Response) => {
  try {
    const roomId = getIdParam(req.params.roomId);

    const activeBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: {
          in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
        },
      },
      select: {
        checkInDate: true,
        checkOutDate: true,
        status: true,
      },
    });

    // Cộng 1 ngày buffer dọn phòng vào cuối mỗi booking (checkOutDate + 1 day)
    const bookedRanges = activeBookings.map((booking) => {
      const checkOut = new Date(booking.checkOutDate);
      const checkOutWithBuffer = new Date(checkOut);
      checkOutWithBuffer.setDate(checkOut.getDate() + 1);

      return {
        start: booking.checkInDate.toISOString().split('T')[0],
        end: checkOutWithBuffer.toISOString().split('T')[0],
        status: booking.status,
      };
    });

    res.status(200).json({ data: bookedRanges });
  } catch (error: any) {
    console.error('Error fetching booked dates:', error);
    res.status(500).json({ message: 'Failed to fetch booked dates', error: error.message });
  }
};
