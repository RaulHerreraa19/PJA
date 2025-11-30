import { Request, Response } from 'express';
import { catalogsService } from '../services/catalogs.service';
import { created, noContent, ok } from '../utils/http';

export const listDepartmentsCatalog = async (_req: Request, res: Response) => {
  const departments = await catalogsService.listDepartments();
  return ok(res, departments);
};

export const createDepartment = async (req: Request, res: Response) => {
  const department = await catalogsService.createDepartment(req.body);
  return created(res, department);
};

export const updateDepartment = async (req: Request, res: Response) => {
  const department = await catalogsService.updateDepartment(req.params.id, req.body);
  return ok(res, department);
};

export const deleteDepartment = async (req: Request, res: Response) => {
  await catalogsService.removeDepartment(req.params.id);
  return noContent(res);
};

export const listPositionsCatalog = async (_req: Request, res: Response) => {
  const positions = await catalogsService.listPositions();
  return ok(res, positions);
};

export const createPosition = async (req: Request, res: Response) => {
  const position = await catalogsService.createPosition(req.body);
  return created(res, position);
};

export const updatePosition = async (req: Request, res: Response) => {
  const position = await catalogsService.updatePosition(req.params.id, req.body);
  return ok(res, position);
};

export const deletePosition = async (req: Request, res: Response) => {
  await catalogsService.removePosition(req.params.id);
  return noContent(res);
};

export const listSchedulesCatalog = async (_req: Request, res: Response) => {
  const schedules = await catalogsService.listSchedules();
  return ok(res, schedules);
};

export const createSchedule = async (req: Request, res: Response) => {
  const schedule = await catalogsService.createSchedule(req.body);
  return created(res, schedule);
};

export const updateSchedule = async (req: Request, res: Response) => {
  const schedule = await catalogsService.updateSchedule(req.params.id, req.body);
  return ok(res, schedule);
};

export const deleteSchedule = async (req: Request, res: Response) => {
  await catalogsService.removeSchedule(req.params.id);
  return noContent(res);
};
