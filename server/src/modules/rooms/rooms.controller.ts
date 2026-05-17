import { Request, Response } from 'express';
import prisma from '../../config/database';

// Helper: Safely extract ID from params
const getIdParam = (val: any): string => {
  if (Array.isArray(val)) return val[0];
  return val;
};

// Helper: Safely extract query string
const getQueryString = (val: any): string | null => {
  if (Array.isArray(val)) return val[0] || null;
  return val || null;
};

// ============ TASK 2.3: Check Room Availability ============
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

    // Check if there are any conflicting bookings
    const checkInDateTime = new Date(checkInDate);
    const checkOutDateTime = new Date(checkOutDate);

    const conflictingBookings = room.bookings.filter((booking) => {
      const bookingStart = new Date(booking.checkInDate);
      const bookingEnd = new Date(booking.checkOutDate);

      // Check if booking status is not cancelled
      if (booking.status === 'cancelled') {
        return false;
      }

      // Check for date overlap
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

// ============ Optional: Get Room Details ============
export const getRoomDetail = async (req: Request, res: Response) => {
  try {
    const roomId = getIdParam(req.params.roomId);

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        hotel: true,
        bookings: {
          where: { status: { not: 'cancelled' } },
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
