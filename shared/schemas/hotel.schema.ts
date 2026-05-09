import { z } from 'zod';

export const createHotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  amenities: z.string().optional(),
});

export const updateHotelSchema = createHotelSchema.partial();

export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;
