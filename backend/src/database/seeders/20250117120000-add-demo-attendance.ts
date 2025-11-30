import { QueryInterface } from 'sequelize';
import { randomUUID } from 'crypto';

const SOURCE = 'seed-demo';

interface SampleDay {
  offset: number;
  status: 'present' | 'absent' | 'late' | 'leave';
  totalMinutes: number;
  checkIn?: { hour: number; minute: number };
  checkOut?: { hour: number; minute: number };
}

const SAMPLE_DAYS: SampleDay[] = [
  { offset: 0, status: 'present', totalMinutes: 475, checkIn: { hour: 9, minute: 5 }, checkOut: { hour: 18, minute: 0 } },
  { offset: 1, status: 'late', totalMinutes: 455, checkIn: { hour: 9, minute: 25 }, checkOut: { hour: 18, minute: 5 } },
  { offset: 2, status: 'absent', totalMinutes: 0 },
  { offset: 3, status: 'present', totalMinutes: 470, checkIn: { hour: 9, minute: 0 }, checkOut: { hour: 17, minute: 50 } },
  { offset: 4, status: 'leave', totalMinutes: 240, checkIn: { hour: 9, minute: 0 }, checkOut: { hour: 13, minute: 0 } }
];

const dateOnly = (date: Date) => date.toISOString().slice(0, 10);

export default {
  up: async (queryInterface: QueryInterface) => {
    const [[employee]] = (await queryInterface.sequelize.query(
      "SELECT id FROM employees WHERE employee_code = 'EMP-001' LIMIT 1"
    )) as [{ id: string }[], unknown];

    if (!employee?.id) {
      return;
    }

    const [[period]] = (await queryInterface.sequelize.query(
      "SELECT id, start_date FROM periods WHERE status = 'open' ORDER BY start_date ASC LIMIT 1"
    )) as [{ id: string; start_date: string }[], unknown];

    if (!period?.id || !period.start_date) {
      return;
    }

    const [[existing]] = (await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM attendance_computed WHERE employee_id = :employeeId AND period_id = :periodId',
      {
        replacements: { employeeId: employee.id, periodId: period.id }
      }
    )) as [{ count: number }[], unknown];

    if (Number(existing?.count ?? 0) > 0) {
      return;
    }

    const periodStart = new Date(period.start_date);
    const now = new Date();

    const rows = SAMPLE_DAYS.map((pattern) => {
      const day = new Date(periodStart);
      day.setDate(day.getDate() + pattern.offset);

      const createDate = (...args: [number, number]) => {
        const instance = new Date(day);
        instance.setHours(args[0], args[1], 0, 0);
        return instance;
      };

      return {
        id: randomUUID(),
        employee_id: employee.id,
        period_id: period.id,
        date: dateOnly(day),
        check_in: pattern.checkIn ? createDate(pattern.checkIn.hour, pattern.checkIn.minute) : null,
        check_out: pattern.checkOut ? createDate(pattern.checkOut.hour, pattern.checkOut.minute) : null,
        status: pattern.status,
        total_minutes: pattern.totalMinutes,
        source: SOURCE,
        created_at: now,
        updated_at: now
      };
    });

    await queryInterface.bulkInsert('attendance_computed', rows);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('attendance_computed', { source: SOURCE });
  }
};
