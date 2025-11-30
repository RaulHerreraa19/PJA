import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User } from './User';

export interface AuditLogAttributes {
  id: string;
  userId: string;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
}

export type AuditLogCreationAttributes = Optional<AuditLogAttributes, 'id' | 'entity' | 'entityId' | 'details' | 'ipAddress'>;

export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  declare id: string;
  declare userId: string;
  declare action: string;
  declare entity: string | null;
  declare entityId: string | null;
  declare details: string | null;
  declare ipAddress: string | null;
}

export const initAuditLogModel = (sequelize: Sequelize) => {
  AuditLog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      entity: {
        type: DataTypes.STRING,
        allowNull: true
      },
      entityId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: 'audit_logs',
      sequelize,
      timestamps: true
    }
  );

  AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
};
