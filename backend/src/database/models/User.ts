import { BelongsToGetAssociationMixin, DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Role } from './Role';

export interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  roleId: string;
  refreshTokenHash?: string | null;
  status: 'active' | 'inactive';
  lastLoginAt?: Date | null;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'refreshTokenHash' | 'status' | 'lastLoginAt'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare passwordHash: string;
  declare roleId: string;
  declare refreshTokenHash: string | null;
  declare status: 'active' | 'inactive';
  declare lastLoginAt: Date | null;
  declare role?: Role;
  declare getRole: BelongsToGetAssociationMixin<Role>;
}

export type UserInstance = User;

export const initUserModel = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        }
      },
      refreshTokenHash: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'users',
      sequelize,
      timestamps: true,
      paranoid: true
    }
  );

  User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
  Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
};
