import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface IncidenceRuleAttributes {
  id: string;
  name: string;
  description?: string | null;
  type: 'delay' | 'absence' | 'overtime';
  thresholdMinutes?: number | null;
  penalty?: string | null;
}

export type IncidenceRuleCreationAttributes = Optional<IncidenceRuleAttributes, 'id' | 'description' | 'thresholdMinutes' | 'penalty'>;

export class IncidenceRule extends Model<IncidenceRuleAttributes, IncidenceRuleCreationAttributes>
  implements IncidenceRuleAttributes
{
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare type: 'delay' | 'absence' | 'overtime';
  declare thresholdMinutes: number | null;
  declare penalty: string | null;
}

export const initIncidenceRuleModel = (sequelize: Sequelize) => {
  IncidenceRule.init(
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      type: {
        type: DataTypes.ENUM('delay', 'absence', 'overtime'),
        allowNull: false
      },
      thresholdMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      penalty: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: 'incidence_rules',
      sequelize,
      timestamps: true
    }
  );
};
