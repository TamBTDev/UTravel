import { Request, Response } from 'express';
import prisma from '../../config/database';

// Helper: Safely extract ID from params
const getIdParam = (val: any): string => {
  if (Array.isArray(val)) return val[0];
  return val;
};

// ============ TASK 2.4: Create Booking ============
export const createBooking = async (req: Request, res: Response) => {
  try {
    // Get userId from auth middleware
    const userId = (req as any).userId;

    const { roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;

    // Validate required fields
    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Missing required fields: roomId, checkInDate, checkOutDate' });
    }

    // Get room info
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Parse dates
    const checkInDt = new Date(checkInDate);
    const checkOutDt = new Date(checkOutDate);

    // Validate date range
    if (checkInDt >= checkOutDt) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: { not: 'cancelled' },
        checkInDate: { lt: checkOutDt },
        checkOutDate: { gt: checkInDt },
      },
    });

    if (conflictingBookings.length > 0) {
      return res.status(409).json({ message: 'Room is not available for the selected dates' });
    }

    // Calculate number of nights and total price
    const nights = Math.ceil((checkOutDt.getTime() - checkInDt.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        checkInDate: checkInDt,
        checkOutDate: checkOutDt,
        numberOfGuests: numberOfGuests || 1,
        specialRequests: specialRequests || '',
        totalPrice,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
      include: {
        room: { include: { hotel: true } },
      },
    });

    res.status(201).json({ data: booking });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

// ============ TASK 2.5: Get User Bookings ============
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        room: { include: { hotel: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: bookings });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};

// ============ TASK 2.6: Update Booking Status ============
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const { status } = req.body;
    const userId = (req as any).userId;

    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find booking and check ownership
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only allow user to cancel their own booking or admin to change status
    if (booking.userId !== userId && (req as any).userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        room: { include: { hotel: true } },
        payment: true,
      },
    });

    res.status(200).json({ data: updated });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Failed to update booking', error: error.message });
  }
};

// ============ Optional: Get Booking Detail ============
export const getBookingDetail = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const userId = (req as any).userId;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: { include: { hotel: true } },
        payment: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (booking.userId !== userId && (req as any).userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({ data: booking });
  } catch (error: any) {
    console.error('Error fetching booking detail:', error);
    res.status(500).json({ message: 'Failed to fetch booking detail', error: error.message });
  }
};
