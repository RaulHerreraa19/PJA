import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';
import { AppError } from '../utils/errors';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn({ err }, 'Handled application error');
    return res.status(err.statusCode).json({ status: 'error', error: err.message, details: err.details });
  }

  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({ status: 'error', error: 'Internal server error' });
};
