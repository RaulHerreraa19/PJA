import { Op } from 'sequelize';
import {
  AttendanceComputed,
  Employee,
  Incidence,
  IncidenceRule,
  IncidenceStatus,
  IncidenceType
} from '../database/models';
import { AppError } from '../utils/errors';

export interface ListIncidencesParams {
  status?: IncidenceStatus;
  type?: IncidenceType;
  employeeId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface DelayIncidencePayload {
  employeeId: string;
  attendanceId?: string | null;
  ruleId?: string | null;
  minutesLate: number;
  occurredAt: Date;
}

export interface ManualIncidencePayload {
  employeeId: string;
  type: IncidenceType;
  occurredAt: Date;
  minutes?: number | null;
  notes?: string | null;
  ruleId?: string | null;
  attendanceId?: string | null;
}

class IncidenceService {
  list(params: ListIncidencesParams) {
    const where: Record<string, unknown> = {};

    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;
    if (params.employeeId) where.employeeId = params.employeeId;

    if (params.startDate || params.endDate) {
      where.occurredAt = {
        ...(params.startDate ? { [Op.gte]: params.startDate } : {}),
        ...(params.endDate ? { [Op.lte]: params.endDate } : {})
      };
    }

    return Incidence.findAll({
      where,
      include: [
        { model: Employee, as: 'employee' },
        { model: AttendanceComputed, as: 'attendance' },
        { model: IncidenceRule, as: 'rule' }
      ],
      order: [['occurredAt', 'DESC']]
    });
  }

  async recordDelay(payload: DelayIncidencePayload) {
    const [incidence, created] = await Incidence.findOrCreate({
      where: {
        employeeId: payload.employeeId,
        attendanceId: payload.attendanceId ?? null,
        type: 'delay'
      },
      defaults: {
        employeeId: payload.employeeId,
        attendanceId: payload.attendanceId ?? null,
        ruleId: payload.ruleId ?? null,
        type: 'delay',
        occurredAt: payload.occurredAt,
        minutes: payload.minutesLate,
        status: 'pending'
      }
    });

    if (!created) {
      await incidence.update({
        occurredAt: payload.occurredAt,
        minutes: payload.minutesLate,
        ruleId: payload.ruleId ?? incidence.ruleId,
        status: incidence.status === 'dismissed' ? 'dismissed' : incidence.status
      });
    }

    return incidence;
  }

  async updateStatus(id: string, payload: { status: IncidenceStatus; notes?: string | null }) {
    const incidence = await Incidence.findByPk(id);
    if (!incidence) throw new AppError('Incidencia no encontrada', 404);

    return incidence.update({
      status: payload.status,
      notes: payload.notes ?? null
    });
  }

  async clearDelay(employeeId: string, attendanceId?: string | null) {
    await Incidence.destroy({
      where: {
        employeeId,
        attendanceId: attendanceId ?? null,
        type: 'delay',
        status: 'pending'
      }
    });
  }

  async createManual(payload: ManualIncidencePayload) {
    const employee = await Employee.findByPk(payload.employeeId);
    if (!employee) throw new AppError('Empleado no encontrado', 404);

    if (payload.ruleId) {
      const rule = await IncidenceRule.findByPk(payload.ruleId);
      if (!rule) throw new AppError('Regla de incidencia no encontrada', 404);
    }

    if (payload.attendanceId) {
      const attendance = await AttendanceComputed.findByPk(payload.attendanceId);
      if (!attendance) throw new AppError('Registro de asistencia no encontrado', 404);
    }

    const incidence = await Incidence.create({
      employeeId: payload.employeeId,
      attendanceId: payload.attendanceId ?? null,
      ruleId: payload.ruleId ?? null,
      type: payload.type,
      occurredAt: payload.occurredAt,
      minutes: payload.minutes ?? null,
      status: 'pending',
      notes: payload.notes ?? null
    });

    await incidence.reload({
      include: [
        { model: Employee, as: 'employee' },
        { model: AttendanceComputed, as: 'attendance' },
        { model: IncidenceRule, as: 'rule' }
      ]
    });

    return incidence;
  }
}

export const incidenceService = new IncidenceService();
