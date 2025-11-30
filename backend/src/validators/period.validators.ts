import { z } from 'zod';

export const createPeriodSchema = z.object({
  name: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date()
});
