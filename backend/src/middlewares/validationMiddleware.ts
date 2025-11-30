import { ZodTypeAny } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';

export const validateBody = (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    throw new AppError('Validation error', 422, result.error.flatten());
  }
  req.body = result.data;
  next();
};

export const validateQuery = (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    throw new AppError('Validation error', 422, result.error.flatten());
  }
  req.query = result.data;
  next();
};
