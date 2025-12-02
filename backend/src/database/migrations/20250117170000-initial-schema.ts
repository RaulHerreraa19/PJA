import { DataTypes, QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('roles', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.ENUM('admin', 'rh', 'user', 'jefaturas-adscripciones', 'ti'),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING
      }
    });

    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
        onUpdate: 'CASCADE'
      },
      refresh_token_hash: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
      },
      last_login_at: {
        type: DataTypes.DATE
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE
    });

    await queryInterface.createTable('departments', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });

    await queryInterface.createTable('positions', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      department_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'departments', key: 'id' },
        onUpdate: 'CASCADE'
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });

    await queryInterface.createTable('schedules', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'UTC'
      },
      start_time: {
        type: DataTypes.STRING,
        allowNull: false
      },
      end_time: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });

    await queryInterface.createTable('employees', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      employee_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: DataTypes.STRING,
      department_id: {
        type: DataTypes.UUID,
        references: { model: 'departments', key: 'id' },
        onUpdate: 'CASCADE'
      },
      position_id: {
        type: DataTypes.UUID,
        references: { model: 'positions', key: 'id' },
        onUpdate: 'CASCADE'
      },
      schedule_id: {
        type: DataTypes.UUID,
        references: { model: 'schedules', key: 'id' },
        onUpdate: 'CASCADE'
      },
      hire_date: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });

    await queryInterface.createTable('periods', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      name: DataTypes.STRING,
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM('open', 'closed'),
        defaultValue: 'open'
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });

    await queryInterface.createTable('incidence_rules', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      type: {
        type: DataTypes.ENUM('delay', 'absence', 'overtime'),
        allowNull: false
      },
      threshold_minutes: DataTypes.INTEGER,
      penalty: DataTypes.STRING,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });

    await queryInterface.createTable('raw_clockings', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      employee_code: {
        type: DataTypes.STRING,
        allowNull: false
      },
      employee_id: {
        type: DataTypes.UUID,
        references: { model: 'employees', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      device_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      clocked_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      source_file: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'processed', 'error'),
        defaultValue: 'pending'
      },
      error_message: DataTypes.STRING,
      raw_payload: DataTypes.JSON,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });

    await queryInterface.addIndex('raw_clockings', ['employee_code', 'clocked_at']);

    await queryInterface.createTable('attendance_computed', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      employee_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      period_id: {
        type: DataTypes.UUID,
        references: { model: 'periods', key: 'id' },
        onUpdate: 'CASCADE'
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      check_in: DataTypes.DATE,
      check_out: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM('present', 'absent', 'late', 'leave'),
        defaultValue: 'present'
      },
      total_minutes: DataTypes.INTEGER,
      source: {
        type: DataTypes.STRING,
        defaultValue: 'import'
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });

    await queryInterface.addConstraint('attendance_computed', {
      type: 'unique',
      fields: ['employee_id', 'date'],
      name: 'uniq_attendance_per_day'
    });

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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      attendance_id: {
        type: DataTypes.UUID,
        references: { model: 'attendance_computed', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      rule_id: {
        type: DataTypes.UUID,
        references: { model: 'incidence_rules', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      type: {
        type: DataTypes.ENUM('delay', 'absence', 'early_exit', 'overtime'),
        allowNull: false
      },
      occurred_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      minutes: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM('pending', 'acknowledged', 'dismissed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      notes: DataTypes.TEXT,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });

    await queryInterface.addIndex('incidences', ['employee_id', 'type']);
    await queryInterface.addIndex('incidences', ['status']);

    await queryInterface.createTable('audit_logs', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      entity: DataTypes.STRING,
      entity_id: DataTypes.STRING,
      details: DataTypes.TEXT,
      ip_address: DataTypes.STRING,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('incidences');
    await queryInterface.dropTable('attendance_computed');
    await queryInterface.dropTable('raw_clockings');
    await queryInterface.dropTable('incidence_rules');
    await queryInterface.dropTable('periods');
    await queryInterface.dropTable('employees');
    await queryInterface.dropTable('schedules');
    await queryInterface.dropTable('positions');
    await queryInterface.dropTable('departments');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('roles');
  }
};
