import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type ApiResponse<T> = z.infer<typeof apiResponseSchema> & { data?: T };
