import { Request, Response } from 'express';
import { employeeService } from '../services/employee.service';
import { created, noContent, ok } from '../utils/http';

export const listEmployees = async (_req: Request, res: Response) => {
  const employees = await employeeService.list();
  return ok(res, employees);
};

export const createEmployee = async (req: Request, res: Response) => {
  const employee = await employeeService.create(req.body);
  return created(res, employee);
};

export const updateEmployee = async (req: Request, res: Response) => {
  const employee = await employeeService.update(req.params.id, req.body);
  return ok(res, employee);
};

export const deleteEmployee = async (req: Request, res: Response) => {
  await employeeService.remove(req.params.id);
  return noContent(res);
};
