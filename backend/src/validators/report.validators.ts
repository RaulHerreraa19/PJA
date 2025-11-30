import { z } from 'zod';

export const periodReportSchema = z.object({
  periodId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  positionId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  status: z.enum(['present', 'absent', 'late', 'leave']).optional()
});
