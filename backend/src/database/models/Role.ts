import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export const ROLE_VALUES = ['admin', 'rh', 'user', 'jefaturas-adscripciones', 'ti'] as const;
export type RoleName = (typeof ROLE_VALUES)[number];

export interface RoleAttributes {
  id: string;
  name: RoleName;
  description?: string | null;
}

export type RoleCreationAttributes = Optional<RoleAttributes, 'id'>;

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  declare id: string;
  declare name: RoleName;
  declare description: string | null;
}

export const initRoleModel = (sequelize: Sequelize) => {
  Role.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.ENUM(...ROLE_VALUES),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: 'roles',
      sequelize,
      timestamps: false
    }
  );
};
