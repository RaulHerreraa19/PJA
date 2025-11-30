import { Request, Response } from 'express';
import { clockingService } from '../services/clocking.service';
import { ok } from '../utils/http';

export const listClockings = async (req: Request, res: Response) => {
  const clockings = await clockingService.list(req.query.status as string | undefined);
  return ok(res, clockings);
};
