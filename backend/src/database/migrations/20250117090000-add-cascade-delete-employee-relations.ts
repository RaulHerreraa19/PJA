import { QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint('attendance_computed', 'attendance_computed_ibfk_1');
    await queryInterface.addConstraint('attendance_computed', {
      fields: ['employee_id'],
      type: 'foreign key',
      name: 'fk_attendance_computed_employee',
      references: {
        table: 'employees',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.removeConstraint('raw_clockings', 'raw_clockings_ibfk_1');
    await queryInterface.addConstraint('raw_clockings', {
      fields: ['employee_id'],
      type: 'foreign key',
      name: 'fk_raw_clockings_employee',
      references: {
        table: 'employees',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint('attendance_computed', 'fk_attendance_computed_employee');
    await queryInterface.addConstraint('attendance_computed', {
      fields: ['employee_id'],
      type: 'foreign key',
      name: 'attendance_computed_ibfk_1',
      references: {
        table: 'employees',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    await queryInterface.removeConstraint('raw_clockings', 'fk_raw_clockings_employee');
    await queryInterface.addConstraint('raw_clockings', {
      fields: ['employee_id'],
      type: 'foreign key',
      name: 'raw_clockings_ibfk_1',
      references: {
        table: 'employees',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  }
};
