import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { created, ok } from '../utils/http';

export const listUsers = async (_req: Request, res: Response) => {
  const users = await userService.list();
  return ok(res, users);
};

export const createUser = async (req: Request, res: Response) => {
  const user = await userService.create(req.body);
  return created(res, user);
};
