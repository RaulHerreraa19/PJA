import { z } from 'zod';

export const attendanceQuerySchema = z.object({
  periodId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional()
});
