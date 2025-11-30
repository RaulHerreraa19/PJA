import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Employee } from './Employee';

export interface RawClockingAttributes {
  id: string;
  employeeCode: string;
  employeeId?: string | null;
  deviceId: string;
  clockedAt: Date;
  sourceFile: string;
  status: 'pending' | 'processed' | 'error';
  errorMessage?: string | null;
  rawPayload?: Record<string, unknown> | null;
}

export type RawClockingCreationAttributes = Optional<RawClockingAttributes, 'id' | 'employeeId' | 'status' | 'errorMessage' | 'rawPayload'>;

export class RawClocking extends Model<RawClockingAttributes, RawClockingCreationAttributes> implements RawClockingAttributes {
  declare id: string;
  declare employeeCode: string;
  declare employeeId: string | null;
  declare deviceId: string;
  declare clockedAt: Date;
  declare sourceFile: string;
  declare status: 'pending' | 'processed' | 'error';
  declare errorMessage: string | null;
  declare rawPayload: Record<string, unknown> | null;
}

export const initRawClockingModel = (sequelize: Sequelize) => {
  RawClocking.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      employeeCode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      employeeId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'employees',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      deviceId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      clockedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      sourceFile: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'processed', 'error'),
        allowNull: false,
        defaultValue: 'pending'
      },
      errorMessage: {
        type: DataTypes.STRING,
        allowNull: true
      },
      rawPayload: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      tableName: 'raw_clockings',
      sequelize,
      timestamps: true,
      indexes: [{ fields: ['employee_code', 'clocked_at'] }]
    }
  );

  RawClocking.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
};
