import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Department } from './Department';

export interface PositionAttributes {
  id: string;
  name: string;
  departmentId: string;
}

export type PositionCreationAttributes = Optional<PositionAttributes, 'id'>;

export class Position extends Model<PositionAttributes, PositionCreationAttributes> implements PositionAttributes {
  declare id: string;
  declare name: string;
  declare departmentId: string;
}

export const initPositionModel = (sequelize: Sequelize) => {
  Position.init(
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
      departmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'departments',
          key: 'id'
        }
      }
    },
    {
      tableName: 'positions',
      sequelize,
      timestamps: true
    }
  );

  Position.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
  Department.hasMany(Position, { foreignKey: 'departmentId', as: 'positions' });
};
