import { z } from 'zod';

export const incidencesQuerySchema = z
  .object({
    status: z.enum(['pending', 'acknowledged', 'dismissed']).optional(),
    type: z.enum(['delay', 'absence', 'early_exit', 'overtime']).optional(),
    employeeId: z.string().uuid().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional()
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    { path: ['endDate'], message: 'La fecha final debe ser posterior a la inicial' }
  );

export const updateIncidenceSchema = z.object({
  status: z.enum(['pending', 'acknowledged', 'dismissed']),
  notes: z.string().trim().max(1000).optional()
});

export const createIncidenceSchema = z.object({
  employeeId: z.string().uuid(),
  type: z.enum(['delay', 'absence', 'early_exit', 'overtime']),
  occurredAt: z.coerce.date(),
  minutes: z
    .number()
    .int()
    .min(0)
    .max(24 * 60)
    .optional(),
  notes: z.string().trim().max(1000).optional(),
  ruleId: z.string().uuid().optional(),
  attendanceId: z.string().uuid().optional()
});
