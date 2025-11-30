import { z } from 'zod';

export const importClockingsSchema = z.object({
  format: z.enum(['csv', 'dat']).optional()
});
