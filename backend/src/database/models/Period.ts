import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface PeriodAttributes {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'open' | 'closed';
}

export type PeriodCreationAttributes = Optional<PeriodAttributes, 'id' | 'status'>;

export class Period extends Model<PeriodAttributes, PeriodCreationAttributes> implements PeriodAttributes {
  declare id: string;
  declare name: string;
  declare startDate: Date;
  declare endDate: Date;
  declare status: 'open' | 'closed';
}

export const initPeriodModel = (sequelize: Sequelize) => {
  Period.init(
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
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('open', 'closed'),
        allowNull: false,
        defaultValue: 'open'
      }
    },
    {
      tableName: 'periods',
      sequelize,
      timestamps: true
    }
  );
};
