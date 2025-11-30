import { z } from 'zod';

export const positionSchema = z.object({
  name: z.string().min(1),
  departmentId: z.string().uuid()
});
