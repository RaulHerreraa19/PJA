import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Employee } from './Employee';
import { Period } from './Period';

export interface AttendanceComputedAttributes {
  id: string;
  employeeId: string;
  periodId?: string | null;
  date: string;
  checkIn?: Date | null;
  checkOut?: Date | null;
  status: 'present' | 'absent' | 'late' | 'leave';
  totalMinutes?: number | null;
  source: string;
}

export type AttendanceComputedCreationAttributes = Optional<AttendanceComputedAttributes, 'id' | 'periodId' | 'checkIn' | 'checkOut' | 'totalMinutes'>;

export class AttendanceComputed
  extends Model<AttendanceComputedAttributes, AttendanceComputedCreationAttributes>
  implements AttendanceComputedAttributes
{
  declare id: string;
  declare employeeId: string;
  declare periodId: string | null;
  declare date: string;
  declare checkIn: Date | null;
  declare checkOut: Date | null;
  declare status: 'present' | 'absent' | 'late' | 'leave';
  declare totalMinutes: number | null;
  declare source: string;
  declare employee?: Employee;
  declare period?: Period;
}

export const initAttendanceComputedModel = (sequelize: Sequelize) => {
  AttendanceComputed.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      employeeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      periodId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'periods',
          key: 'id'
        }
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      checkIn: {
        type: DataTypes.DATE,
        allowNull: true
      },
      checkOut: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('present', 'absent', 'late', 'leave'),
        allowNull: false,
        defaultValue: 'present'
      },
      totalMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'import'
      }
    },
    {
      tableName: 'attendance_computed',
      sequelize,
      timestamps: true,
      indexes: [{ unique: true, fields: ['employee_id', 'date'] }]
    }
  );

  AttendanceComputed.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
  AttendanceComputed.belongsTo(Period, { foreignKey: 'periodId', as: 'period' });
  Employee.hasMany(AttendanceComputed, { foreignKey: 'employeeId', as: 'attendance' });
};
