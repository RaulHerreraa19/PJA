import { QueryInterface } from 'sequelize';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const ROLE_DATA = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'admin', description: 'Global administrator' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'rh', description: 'HR manager' },
  { id: '33333333-3333-4333-8333-333333333333', name: 'user', description: 'Regular user' },
  { id: 'd1c98376-be5d-4451-a994-8bf4c912f4b3', name: 'ti', description: 'Technical administrator' },
  {
    id: '527c248a-57be-4ac9-b83a-0f98feac0ac7',
    name: 'jefaturas-adscripciones',
    description: 'Consultoria'
  }
];

const USERS = [
  { id: '77777777-7777-4777-8777-777777777777', email: 'admin@empresa.com', password: 'Admin123*', roleName: 'admin' },
  { id: '88888888-8888-4888-8888-888888888888', email: 'rh@empresa.com', password: 'rrhh12345', roleName: 'rh' },
  { id: '99999999-9999-4999-9999-999999999999', email: 'ti@empresa.com', password: 'Ti12345*', roleName: 'ti' },
  {
    id: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    email: 'consultoria@empresa.com',
    password: 'Consultoria123*',
    roleName: 'jefaturas-adscripciones'
  }
];

const DEPARTMENT = { id: '44444444-4444-4444-9444-444444444444', name: 'Human Resources', code: 'HR' };
const POSITION = { id: '55555555-5555-4555-8555-555555555555', name: 'HR Manager' };
const SCHEDULE = {
  id: '66666666-6666-4666-8666-666666666666',
  name: 'Default 9-6',
  timezone: 'America/Mexico_City',
  start_time: '09:00',
  end_time: '18:00'
};
const EMPLOYEE = {
  id: 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  employee_code: 'EMP-001',
  first_name: 'Recursos',
  last_name: 'Humanos',
  email: 'rh@empresa.com',
  hire_date: new Date('2022-01-10'),
  status: 'active' as const
};
const PERIOD = {
  id: 'ccccccc1-cccc-4ccc-8ccc-ccccccccccc1',
  name: 'Q1 2025',
  start_date: new Date('2025-01-01'),
  end_date: new Date('2025-03-31'),
  status: 'open'
};

const ATTENDANCE_SOURCE = 'full-bootstrap';
type SampleDay = {
  offset: number;
  status: 'present' | 'absent' | 'late' | 'leave';
  totalMinutes: number;
  checkIn?: { hour: number; minute: number };
  checkOut?: { hour: number; minute: number };
};

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
    const now = new Date();

    // Roles
    const roleNames = ROLE_DATA.map((role) => role.name);
    const [roleRows] = (await queryInterface.sequelize.query(
      'SELECT id, name FROM roles WHERE name IN (:roleNames)',
      { replacements: { roleNames } }
    )) as [{ id: string; name: string }[], unknown];

    const existingRoleNames = new Set(roleRows.map((role) => role.name));
    const roleInserts = ROLE_DATA.filter((role) => !existingRoleNames.has(role.name));
    if (roleInserts.length) {
      await queryInterface.bulkInsert('roles', roleInserts);
    }

    const [roleRecords] = (await queryInterface.sequelize.query(
      'SELECT id, name FROM roles WHERE name IN (:roleNames)',
      { replacements: { roleNames } }
    )) as [{ id: string; name: string }[], unknown];
    const roleMap = new Map(roleRecords.map((role) => [role.name, role.id]));

    // Department
    const [[departmentRow]] = (await queryInterface.sequelize.query(
      'SELECT id FROM departments WHERE code = :code LIMIT 1',
      { replacements: { code: DEPARTMENT.code } }
    )) as [{ id: string }[], unknown];

    let departmentId = departmentRow?.id;
    if (!departmentId) {
      await queryInterface.bulkInsert('departments', [
        {
          id: DEPARTMENT.id,
          name: DEPARTMENT.name,
          code: DEPARTMENT.code,
          created_at: now,
          updated_at: now
        }
      ]);
      departmentId = DEPARTMENT.id;
    }

    // Position
    const [[positionRow]] = (await queryInterface.sequelize.query(
      'SELECT id FROM positions WHERE name = :name AND department_id = :departmentId LIMIT 1',
      { replacements: { name: POSITION.name, departmentId } }
    )) as [{ id: string }[], unknown];

    let positionId = positionRow?.id;
    if (!positionId) {
      await queryInterface.bulkInsert('positions', [
        {
          id: POSITION.id,
          name: POSITION.name,
          department_id: departmentId,
          created_at: now,
          updated_at: now
        }
      ]);
      positionId = POSITION.id;
    }

    // Schedule
    const [[scheduleRow]] = (await queryInterface.sequelize.query(
      'SELECT id FROM schedules WHERE name = :name LIMIT 1',
      { replacements: { name: SCHEDULE.name } }
    )) as [{ id: string }[], unknown];

    let scheduleId = scheduleRow?.id;
    if (!scheduleId) {
      await queryInterface.bulkInsert('schedules', [
        {
          id: SCHEDULE.id,
          name: SCHEDULE.name,
          timezone: SCHEDULE.timezone,
          start_time: SCHEDULE.start_time,
          end_time: SCHEDULE.end_time,
          created_at: now,
          updated_at: now
        }
      ]);
      scheduleId = SCHEDULE.id;
    }

    // Users
    const emails = USERS.map((user) => user.email);
    const [userRows] = (await queryInterface.sequelize.query(
      'SELECT email FROM users WHERE email IN (:emails)',
      { replacements: { emails } }
    )) as [{ email: string }[], unknown];

    const existingEmails = new Set(userRows.map((user) => user.email));
    const userInserts = [] as Array<Record<string, unknown>>;

    for (const user of USERS) {
      if (existingEmails.has(user.email)) {
        continue;
      }

      const roleId = roleMap.get(user.roleName);
      if (!roleId) {
        continue;
      }

      userInserts.push({
        id: user.id,
        email: user.email,
        password_hash: await bcrypt.hash(user.password, 12),
        role_id: roleId,
        status: 'active',
        created_at: now,
        updated_at: now
      });
    }

    if (userInserts.length) {
      await queryInterface.bulkInsert('users', userInserts);
    }

    // Employee
    const [[employeeRow]] = (await queryInterface.sequelize.query(
      'SELECT id FROM employees WHERE employee_code = :code LIMIT 1',
      { replacements: { code: EMPLOYEE.employee_code } }
    )) as [{ id: string }[], unknown];

    let employeeId = employeeRow?.id;
    if (!employeeId) {
      await queryInterface.bulkInsert('employees', [
        {
          id: EMPLOYEE.id,
          employee_code: EMPLOYEE.employee_code,
          first_name: EMPLOYEE.first_name,
          last_name: EMPLOYEE.last_name,
          email: EMPLOYEE.email,
          department_id: departmentId,
          position_id: positionId,
          schedule_id: scheduleId,
          hire_date: EMPLOYEE.hire_date,
          status: EMPLOYEE.status,
          created_at: now,
          updated_at: now
        }
      ]);
      employeeId = EMPLOYEE.id;
    }

    // Period
    const [[periodRow]] = (await queryInterface.sequelize.query(
      'SELECT id FROM periods WHERE name = :name LIMIT 1',
      { replacements: { name: PERIOD.name } }
    )) as [{ id: string }[], unknown];

    let periodId = periodRow?.id;
    if (!periodId) {
      await queryInterface.bulkInsert('periods', [
        {
          id: PERIOD.id,
          name: PERIOD.name,
          start_date: PERIOD.start_date,
          end_date: PERIOD.end_date,
          status: PERIOD.status,
          created_at: now,
          updated_at: now
        }
      ]);
      periodId = PERIOD.id;
    }

    // Attendance sample
    const [[attendanceCount]] = (await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM attendance_computed WHERE employee_id = :employeeId AND period_id = :periodId',
      { replacements: { employeeId, periodId } }
    )) as [{ count: number }[], unknown];

    if (!Number(attendanceCount?.count ?? 0)) {
      const rows = SAMPLE_DAYS.map((pattern) => {
        const baseDate = new Date(PERIOD.start_date);
        baseDate.setDate(baseDate.getDate() + pattern.offset);

        const setTime = (time?: { hour: number; minute: number }) => {
          if (!time) {
            return null;
          }
          const d = new Date(baseDate);
          d.setHours(time.hour, time.minute, 0, 0);
          return d;
        };

        return {
          id: randomUUID(),
          employee_id: employeeId,
          period_id: periodId,
          date: dateOnly(baseDate),
          check_in: setTime(pattern.checkIn),
          check_out: setTime(pattern.checkOut),
          status: pattern.status,
          total_minutes: pattern.totalMinutes,
          source: ATTENDANCE_SOURCE,
          created_at: now,
          updated_at: now
        };
      });

      await queryInterface.bulkInsert('attendance_computed', rows);
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('attendance_computed', { source: ATTENDANCE_SOURCE });
    await queryInterface.bulkDelete('periods', { id: PERIOD.id });
    await queryInterface.bulkDelete('employees', { id: EMPLOYEE.id });
    await queryInterface.bulkDelete('users', { id: USERS.map((user) => user.id) });
    await queryInterface.bulkDelete('schedules', { id: SCHEDULE.id });
    await queryInterface.bulkDelete('positions', { id: POSITION.id });
    await queryInterface.bulkDelete('departments', { id: DEPARTMENT.id });
    await queryInterface.bulkDelete('roles', { id: ROLE_DATA.map((role) => role.id) });
  }
};
