import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Department } from './Department';
import { Position } from './Position';
import { Schedule } from './Schedule';

export interface EmployeeAttributes {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  scheduleId?: string | null;
  hireDate?: Date | null;
  status: 'active' | 'inactive';
}

export type EmployeeCreationAttributes = Optional<EmployeeAttributes, 'id' | 'email' | 'departmentId' | 'positionId' | 'scheduleId' | 'hireDate'>;

export class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes {
  declare id: string;
  declare employeeCode: string;
  declare firstName: string;
  declare lastName: string;
  declare email: string | null;
  declare departmentId: string | null;
  declare positionId: string | null;
  declare scheduleId: string | null;
  declare hireDate: Date | null;
  declare status: 'active' | 'inactive';
  declare schedule?: Schedule | null;
}

export const initEmployeeModel = (sequelize: Sequelize) => {
  Employee.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      employeeCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      departmentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id'
        }
      },
      positionId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'positions',
          key: 'id'
        }
      },
      scheduleId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'schedules',
          key: 'id'
        }
      },
      hireDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      }
    },
    {
      tableName: 'employees',
      sequelize,
      timestamps: true
    }
  );

  Employee.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
  Employee.belongsTo(Position, { foreignKey: 'positionId', as: 'position' });
  Employee.belongsTo(Schedule, { foreignKey: 'scheduleId', as: 'schedule' });
  Department.hasMany(Employee, { foreignKey: 'departmentId', as: 'employees' });
  Position.hasMany(Employee, { foreignKey: 'positionId', as: 'employees' });
  Schedule.hasMany(Employee, { foreignKey: 'scheduleId', as: 'employees' });
};
