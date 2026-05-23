import { Request, Response } from "express";
import prisma from "../../config/database";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
} from "../../../../shared/constants/roles";

const getIdParam = (val: any): number => {
  if (Array.isArray(val)) return Number(val[0]);
  return Number(val);
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { roomId, checkInDate, checkOutDate, adults, children, specialNote } =
      req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        message: "Missing required fields: roomId, checkInDate, checkOutDate",
      });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const checkInDt = new Date(checkInDate);
    const checkOutDt = new Date(checkOutDate);

    if (checkInDt >= checkOutDt) {
      return res
        .status(400)
        .json({ message: "Check-out date must be after check-in date" });
    }

    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: { not: BOOKING_STATUS.CANCELLED },
        checkInDate: { lt: checkOutDt },
        checkOutDate: { gt: checkInDt },
      },
    });

    if (conflictingBookings.length > 0) {
      return res
        .status(409)
        .json({ message: "Room is not available for the selected dates" });
    }

    const nights = Math.ceil(
      (checkOutDt.getTime() - checkInDt.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = room.price * nights;

    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        checkInDate: checkInDt,
        checkOutDate: checkOutDt,
        adults: adults || 1,
        children: children || 0,
        specialNote: specialNote || null,
        totalPrice,
        discountAmount: 0,
        finalPrice: totalPrice,
        status: BOOKING_STATUS.PENDING,
        paymentStatus: PAYMENT_STATUS.PENDING,
      },
      include: {
        room: { include: { hotel: true } },
      },
    });

    res.status(201).json({ data: booking });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    res
      .status(500)
      .json({ message: "Failed to create booking", error: error.message });
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        room: { include: { hotel: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ data: bookings });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch bookings", error: error.message });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const { status } = req.body;
    const userId = (req as any).userId;

    const validStatuses = Object.values(BOOKING_STATUS);
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId !== userId && (req as any).userRole !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized" });
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
    console.error("Error updating booking:", error);
    res
      .status(500)
      .json({ message: "Failed to update booking", error: error.message });
  }
};

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
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId !== userId && (req as any).userRole !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({ data: booking });
  } catch (error: any) {
    console.error("Error fetching booking detail:", error);
    res.status(500).json({
      message: "Failed to fetch booking detail",
      error: error.message,
    });
  }
};
