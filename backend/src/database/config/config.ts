import env from '../../config/env';

const databaseConfig = {
  development: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    dialect: 'mysql'
  },
  test: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: `${env.DB_NAME}_test`,
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    dialect: 'mysql',
    logging: false
  }
};

export default databaseConfig;
module.exports = databaseConfig;
