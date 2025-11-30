import { QueryInterface } from 'sequelize';
import { randomUUID } from 'crypto';

const NEW_ROLE_NAMES = ['jefaturas-adscripciones', 'ti'];

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(
      "ALTER TABLE `roles` MODIFY COLUMN `name` ENUM('admin','rh','user','jefaturas-adscripciones','ti') NOT NULL"
    );

    const [rows] = (await queryInterface.sequelize.query(
      "SELECT name FROM roles WHERE name IN ('jefaturas-adscripciones','ti')"
    )) as [{ name: string }[], unknown];

    const existing = new Set(rows.map((row) => row.name));
    const inserts = NEW_ROLE_NAMES.filter((name) => !existing.has(name)).map((name) => ({
      id: randomUUID(),
      name,
      description: name === 'ti' ? 'Technical administrator' : 'Supervisors read-only',
    }));

    if (inserts.length) {
      await queryInterface.bulkInsert('roles', inserts);
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('roles', { name: NEW_ROLE_NAMES });
    await queryInterface.sequelize.query(
      "ALTER TABLE `roles` MODIFY COLUMN `name` ENUM('admin','rh','user') NOT NULL"
    );
  },
};
