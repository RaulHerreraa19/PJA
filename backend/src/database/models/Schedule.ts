import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface ScheduleAttributes {
  id: string;
  name: string;
  timezone: string;
  startTime: string;
  endTime: string;
}

export type ScheduleCreationAttributes = Optional<ScheduleAttributes, 'id'>;

export class Schedule extends Model<ScheduleAttributes, ScheduleCreationAttributes> implements ScheduleAttributes {
  declare id: string;
  declare name: string;
  declare timezone: string;
  declare startTime: string;
  declare endTime: string;
}

export const initScheduleModel = (sequelize: Sequelize) => {
  Schedule.init(
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
      timezone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'UTC'
      },
      startTime: {
        type: DataTypes.STRING,
        allowNull: false
      },
      endTime: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: 'schedules',
      sequelize,
      timestamps: true
    }
  );
};
