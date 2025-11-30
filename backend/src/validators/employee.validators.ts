import { z } from 'zod';

const baseEmployeeSchema = {
  employeeCode: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  departmentId: z.string().uuid().optional(),
  positionId: z.string().uuid().optional(),
  scheduleId: z.string().uuid().optional(),
  hireDate: z.coerce.date().optional(),
  status: z.enum(['active', 'inactive']).optional()
};

export const createEmployeeSchema = z.object(baseEmployeeSchema);

export const updateEmployeeSchema = z
  .object(baseEmployeeSchema)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided'
  });
