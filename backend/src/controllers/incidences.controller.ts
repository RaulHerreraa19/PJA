import { Request, Response } from 'express';
import { incidenceService } from '../services/incidence.service';
import { created, ok } from '../utils/http';
import type { IncidenceStatus, IncidenceType } from '../database/models/Incidence';

export const listIncidences = async (req: Request, res: Response) => {
  const incidences = await incidenceService.list({
    status: req.query.status as IncidenceStatus | undefined,
    type: req.query.type as IncidenceType | undefined,
    employeeId: req.query.employeeId as string | undefined,
    startDate: req.query.startDate as Date | undefined,
    endDate: req.query.endDate as Date | undefined
  });
  return ok(res, incidences);
};

export const updateIncidenceStatus = async (req: Request, res: Response) => {
  const incidence = await incidenceService.updateStatus(req.params.id, {
    status: req.body.status as IncidenceStatus,
    notes: req.body.notes
  });
  return ok(res, incidence);
};

export const createIncidence = async (req: Request, res: Response) => {
  const incidence = await incidenceService.createManual({
    employeeId: req.body.employeeId,
    type: req.body.type as IncidenceType,
    occurredAt: req.body.occurredAt,
    minutes: req.body.minutes,
    notes: req.body.notes,
    ruleId: req.body.ruleId,
    attendanceId: req.body.attendanceId
  });
  return created(res, incidence);
};
