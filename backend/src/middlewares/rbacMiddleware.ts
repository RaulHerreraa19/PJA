import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';
import type { RoleName } from '../database/models';

export const requireRoles = (roles: RoleName[]) => (req: Request, _res: Response, next: NextFunction) => {
  const role = req.auth?.role as RoleName | undefined;
  if (!role || !roles.includes(role)) {
    throw new AppError('Forbidden', 403);
  }
  next();
};
