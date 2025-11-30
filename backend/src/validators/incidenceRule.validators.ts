import { z } from 'zod';

const baseSchema = {
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['delay', 'absence', 'overtime']),
  thresholdMinutes: z.coerce.number().int().positive().optional(),
  penalty: z.string().optional()
};

export const createIncidenceRuleSchema = z.object(baseSchema);

export const updateIncidenceRuleSchema = z.object(baseSchema);
