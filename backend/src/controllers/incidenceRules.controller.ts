import { Request, Response } from 'express';
import { incidenceRulesService } from '../services/incidenceRules.service';
import { created, noContent, ok } from '../utils/http';

export const listIncidenceRules = async (_req: Request, res: Response) => {
  const rules = await incidenceRulesService.list();
  return ok(res, rules);
};

export const createIncidenceRule = async (req: Request, res: Response) => {
  const rule = await incidenceRulesService.create(req.body);
  return created(res, rule);
};

export const updateIncidenceRule = async (req: Request, res: Response) => {
  const rule = await incidenceRulesService.update(req.params.id, req.body);
  return ok(res, rule);
};

export const deleteIncidenceRule = async (req: Request, res: Response) => {
  await incidenceRulesService.remove(req.params.id);
  return noContent(res);
};
