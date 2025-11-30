import { Sequelize } from 'sequelize';
import env from './env';
import logger from './logger';
import { initModels } from '../database/models';

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  dialect: 'mysql',
  logging: env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  define: {
    underscored: true
  }
});

export const connectDatabase = async () => {
  await sequelize.authenticate();
  initModels(sequelize);
  logger.info('Database connection established');
};

export default sequelize;
