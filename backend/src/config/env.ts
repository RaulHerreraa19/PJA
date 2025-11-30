import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000'),
  DB_HOST: z.string(),
  DB_PORT: z.string().default('3306'),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string(),
  BULLMQ_PREFIX: z.string().default('attendance'),
  FILE_UPLOAD_DIR: z.string().default('tmp/uploads'),
  APP_URL: z.string().default('http://localhost:4000'),
  CLOCKINGS_TIMEZONE: z.string().default('America/Mexico_City')
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  REDIS_URL: process.env.REDIS_URL,
  BULLMQ_PREFIX: process.env.BULLMQ_PREFIX,
  FILE_UPLOAD_DIR: process.env.FILE_UPLOAD_DIR,
  APP_URL: process.env.APP_URL,
  CLOCKINGS_TIMEZONE: process.env.CLOCKINGS_TIMEZONE
});

export default env;
