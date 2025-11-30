import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface DepartmentAttributes {
  id: string;
  name: string;
  code: string;
}

export type DepartmentCreationAttributes = Optional<DepartmentAttributes, 'id'>;

export class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes> implements DepartmentAttributes {
  declare id: string;
  declare name: string;
  declare code: string;
}

export const initDepartmentModel = (sequelize: Sequelize) => {
  Department.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
      }
    },
    {
      tableName: 'departments',
      sequelize,
      timestamps: true
    }
  );
};
