import { QueryInterface } from 'sequelize';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const ROLE_CATALOG = [
  {
    id: 'd1c98376-be5d-4451-a994-8bf4c912f4b3',
    name: 'ti',
    description: 'Technical administrator'
  },
  {
    id: '527c248a-57be-4ac9-b83a-0f98feac0ac7',
    name: 'jefaturas-adscripciones',
    description: 'Consultoria'
  }
];

const NEW_USERS = [
  { email: 'ti@empresa.com', password: 'Ti12345*', roleName: 'ti' },
  { email: 'consultoria@empresa.com', password: 'Consultoria123*', roleName: 'jefaturas-adscripciones' }
];

export default {
  up: async (queryInterface: QueryInterface) => {
    const [roleRows] = (await queryInterface.sequelize.query(
      "SELECT id, name FROM roles WHERE name IN ('ti','jefaturas-adscripciones')"
    )) as [{ id: string; name: string }[], unknown];

    const existingRoles = new Set(roleRows.map((row) => row.name));
    const newRoleRecords = ROLE_CATALOG.filter((role) => !existingRoles.has(role.name));

    if (newRoleRecords.length) {
      await queryInterface.bulkInsert('roles', newRoleRecords);
    }

    const [roleRecords] = (await queryInterface.sequelize.query(
      "SELECT id, name FROM roles WHERE name IN ('ti','jefaturas-adscripciones')"
    )) as [{ id: string; name: string }[], unknown];

    const roleMap = new Map(roleRecords.map((role) => [role.name, role.id]));

    const [existingUsers] = (await queryInterface.sequelize.query(
      "SELECT email FROM users WHERE email IN ('ti@empresa.com','consultoria@empresa.com')"
    )) as [{ email: string }[], unknown];

    const existingUserEmails = new Set(existingUsers.map((user) => user.email));

    const userInserts = [];
    for (const user of NEW_USERS) {
      if (existingUserEmails.has(user.email)) {
        continue;
      }

      const roleId = roleMap.get(user.roleName);
      if (!roleId) {
        continue;
      }

      userInserts.push({
        id: randomUUID(),
        email: user.email,
        password_hash: await bcrypt.hash(user.password, 12),
        role_id: roleId,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    if (userInserts.length) {
      await queryInterface.bulkInsert('users', userInserts);
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('users', {
      email: NEW_USERS.map((user) => user.email)
    });
    await queryInterface.bulkDelete('roles', {
      id: ROLE_CATALOG.map((role) => role.id)
    });
  }
};
