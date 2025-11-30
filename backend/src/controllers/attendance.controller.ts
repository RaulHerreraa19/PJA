import { Request, Response } from 'express';
import { attendanceService } from '../services/attendance.service';
import { ok } from '../utils/http';

export const listAttendance = async (req: Request, res: Response) => {
  const attendance = await attendanceService.list({
    periodId: req.query.periodId as string | undefined,
    employeeId: req.query.employeeId as string | undefined
  });
  return ok(res, attendance);
};
