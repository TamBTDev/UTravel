import { z } from 'zod';

export const createRoomSchema = z.object({
  hotelId: z.number(),
  roomNumber: z.string().min(1, 'Room number is required'),
  type: z.enum(['single', 'double', 'suite', 'deluxe']),
  price: z.number().positive('Price must be positive'),
  capacity: z.number().int().positive('Capacity must be positive'),
  description: z.string().optional(),
  amenities: z.string().optional(),
});

export const updateRoomSchema = createRoomSchema.partial();

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
