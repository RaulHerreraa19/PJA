import { z } from 'zod';

const timeRegex = /^\d{2}:\d{2}$/;

export const scheduleSchema = z.object({
  name: z.string().min(1),
  timezone: z.string().min(1),
  startTime: z.string().regex(timeRegex, 'Formato HH:MM'),
  endTime: z.string().regex(timeRegex, 'Formato HH:MM')
});
