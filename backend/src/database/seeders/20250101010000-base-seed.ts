import { QueryInterface } from 'sequelize';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const roleIds = {
  admin: randomUUID(),
  rh: randomUUID(),
  user: randomUUID(),
  ti: randomUUID(),
  jefaturasAdscripciones: randomUUID()
};

const departmentId = randomUUID();
const positionId = randomUUID();
const scheduleId = randomUUID();
const adminUserId = randomUUID();
const rhUserId = randomUUID();
const employeeId = randomUUID();
const periodId = randomUUID();

export default {
  up: async (queryInterface: QueryInterface) => {
    const [roleRows] = (await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM roles')) as [
      { count: number }[],
      unknown
    ];
    const existingRoles = Number(roleRows?.[0]?.count ?? 0);
    if (existingRoles > 0) {
      return;
    }

    await queryInterface.bulkInsert('roles', [
      { id: roleIds.admin, name: 'admin', description: 'Global administrator' },
      { id: roleIds.rh, name: 'rh', description: 'HR manager' },
      { id: roleIds.user, name: 'user', description: 'Regular user' },
      { id: roleIds.ti, name: 'ti', description: 'Technical administrator' },
      {
        id: roleIds.jefaturasAdscripciones,
        name: 'jefaturas-adscripciones',
        description: 'Supervisors read-only'
      }
    ]);

    await queryInterface.bulkInsert('departments', [
      { id: departmentId, name: 'Human Resources', code: 'HR', created_at: new Date(), updated_at: new Date() }
    ]);

    await queryInterface.bulkInsert('positions', [
      { id: positionId, name: 'HR Manager', department_id: departmentId, created_at: new Date(), updated_at: new Date() }
    ]);

    await queryInterface.bulkInsert('schedules', [
      {
        id: scheduleId,
        name: 'Default 9-6',
        timezone: 'America/Mexico_City',
        start_time: '09:00',
        end_time: '18:00',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    await queryInterface.bulkInsert('users', [
      {
        id: adminUserId,
        email: 'admin@empresa.com',
        password_hash: await bcrypt.hash('Admin123*', 12),
        role_id: roleIds.admin,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: rhUserId,
        email: 'rh@empresa.com',
        password_hash: await bcrypt.hash('rrhh12345', 12),
        role_id: roleIds.rh,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    await queryInterface.bulkInsert('employees', [
      {
        id: employeeId,
        employee_code: 'EMP-001',
        first_name: 'Recursos',
        last_name: 'Humanos',
        email: 'rh@empresa.com',
        department_id: departmentId,
        position_id: positionId,
        schedule_id: scheduleId,
        hire_date: new Date('2022-01-10'),
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    await queryInterface.bulkInsert('periods', [
      {
        id: periodId,
        name: 'Q1 2025',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-03-31'),
        status: 'open',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('periods', { id: periodId });
    await queryInterface.bulkDelete('employees', { id: employeeId });
    await queryInterface.bulkDelete('users', { id: [adminUserId, rhUserId] });
    await queryInterface.bulkDelete('schedules', { id: scheduleId });
    await queryInterface.bulkDelete('positions', { id: positionId });
    await queryInterface.bulkDelete('departments', { id: departmentId });
    await queryInterface.bulkDelete('roles', { id: Object.values(roleIds) });
  }
};
