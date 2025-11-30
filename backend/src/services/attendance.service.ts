import { AttendanceComputed, Employee, Period } from '../database/models';

class AttendanceService {
  list(params: { periodId?: string; employeeId?: string }) {
    return AttendanceComputed.findAll({
      where: {
        ...(params.periodId ? { periodId: params.periodId } : {}),
        ...(params.employeeId ? { employeeId: params.employeeId } : {})
      },
      include: [
        { model: Employee, as: 'employee' },
        { model: Period, as: 'period' }
      ],
      order: [['date', 'DESC']]
    });
  }
}

export const attendanceService = new AttendanceService();
