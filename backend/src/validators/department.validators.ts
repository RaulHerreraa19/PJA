import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).max(10)
});
