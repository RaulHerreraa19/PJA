import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { AttendanceComputed } from './AttendanceComputed';
import { Employee } from './Employee';
import { IncidenceRule } from './IncidenceRule';

export type IncidenceType = 'delay' | 'absence' | 'early_exit' | 'overtime';
export type IncidenceStatus = 'pending' | 'acknowledged' | 'dismissed';

export interface IncidenceAttributes {
  id: string;
  employeeId: string;
  attendanceId?: string | null;
  ruleId?: string | null;
  type: IncidenceType;
  occurredAt: Date;
  minutes?: number | null;
  status: IncidenceStatus;
  notes?: string | null;
}

export type IncidenceCreationAttributes = Optional<
  IncidenceAttributes,
  'id' | 'attendanceId' | 'ruleId' | 'minutes' | 'status' | 'notes'
>;

export class Incidence extends Model<IncidenceAttributes, IncidenceCreationAttributes> implements IncidenceAttributes {
  declare id: string;
  declare employeeId: string;
  declare attendanceId: string | null;
  declare ruleId: string | null;
  declare type: IncidenceType;
  declare occurredAt: Date;
  declare minutes: number | null;
  declare status: IncidenceStatus;
  declare notes: string | null;
}

export const initIncidenceModel = (sequelize: Sequelize) => {
  Incidence.init(
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
        }
      },
      attendanceId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'attendance_computed',
          key: 'id'
        }
      },
      ruleId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'incidence_rules',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.ENUM('delay', 'absence', 'early_exit', 'overtime'),
        allowNull: false
      },
      occurredAt: {
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
      }
    },
    {
      tableName: 'incidences',
      sequelize,
      timestamps: true,
      indexes: [{ fields: ['employee_id', 'type', 'status'] }]
    }
  );

  Incidence.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
  Incidence.belongsTo(AttendanceComputed, { foreignKey: 'attendanceId', as: 'attendance' });
  Incidence.belongsTo(IncidenceRule, { foreignKey: 'ruleId', as: 'rule' });
  Employee.hasMany(Incidence, { foreignKey: 'employeeId', as: 'incidences' });
  AttendanceComputed.hasMany(Incidence, { foreignKey: 'attendanceId', as: 'incidences' });
  IncidenceRule.hasMany(Incidence, { foreignKey: 'ruleId', as: 'incidences' });
};
