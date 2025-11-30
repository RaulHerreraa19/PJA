import fs from 'fs';
import path from 'path';
import { differenceInMinutes } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { createWorker } from '../../config/redis';
import { connectDatabase } from '../../config/database';
import { JOBS } from '../../utils/jobNames';
import logger from '../../config/logger';
import { parseClockingFile } from '../../utils/fileParser';
import { AttendanceComputed, Employee, IncidenceRule, RawClocking, Schedule } from '../../database/models';
import { incidenceService } from '../../services/incidence.service';
import env from '../../config/env';

const BATCH_SIZE = 250;
const DEFAULT_DELAY_THRESHOLD = 5;

type Accumulator = Map<string, Date[]>;
type EmployeeWithSchedule = Employee & { schedule?: Schedule | null };
type ImportClockingJobData = { filePath: string; format?: 'csv' | 'dat' };
type ParsedClockingRow = {
  employeeCode: string;
  deviceId: string;
  clockedAt: Date;
  raw?: Record<string, unknown>;
};
const toScheduledDate = (date: string, time: string, timezone?: string) => {
  const tz = timezone && timezone.length > 0 ? timezone : 'UTC';
  return fromZonedTime(`${date}T${time}:00`, tz);
};
const determineBaseThreshold = (rules: IncidenceRule[]) => {
  if (rules.length === 0) return DEFAULT_DELAY_THRESHOLD;
  const first = rules[0];
  return Math.max(first.thresholdMinutes ?? 0, 0);
};
const pickMatchingDelayRule = (minutesLate: number, rules: IncidenceRule[]) => {
  let selected: IncidenceRule | null = null;
  for (const rule of rules) {
    const threshold = rule.thresholdMinutes ?? 0;
    if (minutesLate >= threshold) {
      selected = rule;
    } else {
      break;
    }
  }
  return selected;
};
const evaluateDelayIncidence = async (
  employeeId: string,
  attendanceId: string,
  date: string,
  checkIn: Date | undefined,
  schedule: Schedule | null | undefined,
  delayRules: IncidenceRule[]
) => {
  if (!checkIn || !schedule) {
    await incidenceService.clearDelay(employeeId, attendanceId);
    if (!schedule) {
      logger.warn({ employeeId }, 'Skipping delay evaluation because schedule is missing');
    }
    return;
  }

  const scheduledStart = toScheduledDate(date, schedule.startTime, schedule.timezone);
  const minutesLate = differenceInMinutes(checkIn, scheduledStart);

  if (minutesLate <= 0) {
    await incidenceService.clearDelay(employeeId, attendanceId);
    return;
  }

  const baseThreshold = determineBaseThreshold(delayRules);
  if (minutesLate < baseThreshold) {
    await incidenceService.clearDelay(employeeId, attendanceId);
    return;
  }

  const matchedRule = pickMatchingDelayRule(minutesLate, delayRules);
  await incidenceService.recordDelay({
    employeeId,
    attendanceId,
    ruleId: matchedRule?.id,
    minutesLate,
    occurredAt: checkIn
  });
};

const flushAccumulator = async (
  acc: Accumulator,
  delayRules: IncidenceRule[],
  loadEmployeeById: (employeeId: string) => Promise<EmployeeWithSchedule | null>
) => {
  for (const [key, timestamps] of acc.entries()) {
    const [employeeId, date] = key.split('::');
    timestamps.sort((a, b) => a.getTime() - b.getTime());
    const checkIn = timestamps[0];
    const checkOut = timestamps[timestamps.length - 1];
    const totalMinutesValue = Math.round(((checkOut?.getTime() ?? 0) - (checkIn?.getTime() ?? 0)) / 60000);
    const totalMinutes = Number.isFinite(totalMinutesValue) ? totalMinutesValue : null;

    const [attendance, created] = await AttendanceComputed.findOrCreate({
      where: { employeeId, date },
      defaults: {
        employeeId,
        date,
        status: 'present',
        checkIn,
        checkOut,
        totalMinutes,
        source: 'import'
      }
    });

    if (!created) {
      await attendance.update({
        status: 'present',
        checkIn,
        checkOut,
        totalMinutes,
        source: 'import'
      });
    }

    const employee = await loadEmployeeById(employeeId);
    if (employee && attendance.id) {
      try {
        await evaluateDelayIncidence(employeeId, attendance.id, date, checkIn, employee.schedule, delayRules);
      } catch (err) {
        logger.error({ err, employeeId, date }, 'Failed to evaluate delay incidence');
      }
    } else {
      logger.warn({ employeeId }, 'Unable to evaluate incidences due to missing employee or attendance data');
    }
  }
  acc.clear();
};

const startWorker = async () => {
  await connectDatabase();

  createWorker<ImportClockingJobData>(JOBS.IMPORT_CLOCKINGS, async (job) => {
    const { filePath, format } = job.data;
    const absPath = path.resolve(filePath);
    const timezone = env.CLOCKINGS_TIMEZONE;
    const accumulator: Accumulator = new Map();
    let processed = 0;

    const employeesByCode = new Map<string, EmployeeWithSchedule | null>();
    const employeesById = new Map<string, EmployeeWithSchedule>();

    const loadEmployeeByCode = async (employeeCode: string) => {
      if (employeesByCode.has(employeeCode)) {
        return employeesByCode.get(employeeCode);
      }

      const employee = (await Employee.findOne({
        where: { employeeCode },
        include: [{ model: Schedule, as: 'schedule' }]
      })) as EmployeeWithSchedule | null;

      employeesByCode.set(employeeCode, employee);
      if (employee) {
        employeesById.set(employee.id, employee);
      }

      return employee;
    };

    const loadEmployeeById = async (employeeId: string) => {
      const cached = employeesById.get(employeeId);
      if (cached) return cached;

      const employee = (await Employee.findByPk(employeeId, {
        include: [{ model: Schedule, as: 'schedule' }]
      })) as EmployeeWithSchedule | null;

      if (employee) {
        employeesById.set(employeeId, employee);
        employeesByCode.set(employee.employeeCode, employee);
      }

      return employee;
    };

    const delayRules = await IncidenceRule.findAll({
      where: { type: 'delay' },
      order: [['thresholdMinutes', 'ASC']]
    });

    if (delayRules.length === 0) {
      logger.warn('No delay incidence rules found; using default threshold');
    }

    await parseClockingFile(
      absPath,
      { format, timezone },
      async ({ employeeCode, deviceId, clockedAt, raw }: ParsedClockingRow) => {
        const employee = await loadEmployeeByCode(employeeCode);
        await RawClocking.create({
          employeeCode,
          employeeId: employee?.id ?? undefined,
          deviceId,
          clockedAt,
          sourceFile: path.basename(absPath),
          status: employee ? 'processed' : 'error',
          errorMessage: employee ? null : 'Employee not found',
          rawPayload: raw
        });

        if (employee) {
          const dateKey = formatInTimeZone(clockedAt, timezone, 'yyyy-MM-dd');
          const key = `${employee.id}::${dateKey}`;
          const timestamps = accumulator.get(key) ?? [];
          timestamps.push(clockedAt);
          accumulator.set(key, timestamps);
        }

        processed += 1;
        if (processed % BATCH_SIZE === 0) {
          await flushAccumulator(accumulator, delayRules, loadEmployeeById);
        }
      }
    );

    await flushAccumulator(accumulator, delayRules, loadEmployeeById);

    fs.rm(absPath, { force: true }, (err) => {
      if (err) {
        logger.warn({ err }, 'Unable to remove processed file');
      }
    });

    logger.info({ jobId: job.id, processed }, 'Clockings import completed');
  });
};

startWorker().catch((err) => {
  logger.error({ err }, 'Failed to start import clockings worker');
  process.exit(1);
});
