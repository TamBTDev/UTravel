import { z } from 'zod';

export const createBookingSchema = z.object({
  userId: z.number(),
  roomId: z.number(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
});

export const updateBookingSchema = createBookingSchema.partial();

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
