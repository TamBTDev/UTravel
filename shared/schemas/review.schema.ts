import { z } from 'zod';

export const createReviewSchema = z.object({
  hotelId: z.number().int().positive('Hotel ID is required'),
  bookingId: z.number().int().positive('Booking ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  cleanlinessRating: z.number().min(1).max(5).optional(),
  serviceRating: z.number().min(1).max(5).optional(),
  locationRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
  highlights: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  comment: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long').optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
