import { DataTypes, QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('incidences', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      },
      employee_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onDelete: 'CASCADE'
      },
      attendance_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'attendance_computed', key: 'id' },
        onDelete: 'SET NULL'
      },
      rule_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'incidence_rules', key: 'id' },
        onDelete: 'SET NULL'
      },
      type: {
        type: DataTypes.ENUM('delay', 'absence', 'early_exit', 'overtime'),
        allowNull: false
      },
      occurred_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      minutes: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'acknowledged', 'dismissed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });

    await queryInterface.addIndex('incidences', ['employee_id', 'type']);
    await queryInterface.addIndex('incidences', ['status']);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('incidences');
  }
};
