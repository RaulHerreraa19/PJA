import { Request, Response } from 'express';
import { created, ok } from '../utils/http';
import { periodService } from '../services/period.service';

export const listPeriods = async (_req: Request, res: Response) => {
  const periods = await periodService.list();
  return ok(res, periods);
};

export const createPeriod = async (req: Request, res: Response) => {
  const period = await periodService.create(req.body);
  return created(res, period);
};

export const closePeriod = async (req: Request, res: Response) => {
  const period = await periodService.close(req.params.id);
  return ok(res, period);
};
