import { z } from 'zod';

export const clockingQuerySchema = z.object({
  status: z.enum(['pending', 'processed', 'error']).optional()
});
