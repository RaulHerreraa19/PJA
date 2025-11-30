import fs from 'fs';
import path from 'path';
import app from './app';
import env from './config/env';
import { connectDatabase } from './config/database';
import logger from './config/logger';

const bootstrap = async () => {
  const uploadDir = path.resolve(env.FILE_UPLOAD_DIR);
  fs.mkdirSync(uploadDir, { recursive: true });

  await connectDatabase();

  app.listen(Number(env.PORT), () => {
    logger.info(`API running on port ${env.PORT}`);
  });
};

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
