import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { parse } from 'csv-parse';
import { fromZonedTime } from 'date-fns-tz';

export interface ClockingParserOptions {
  format?: 'csv' | 'dat';
  delimiter?: string;
  columns?: {
    employeeCode: string;
    deviceId: string;
    timestamp: string;
    [key: string]: string;
  };
  timezone?: string;
}

export interface ParsedClockingRow {
  employeeCode: string;
  deviceId: string;
  clockedAt: Date;
  raw: Record<string, string>;
}

const resolveFormat = (filePath: string, format?: ClockingParserOptions['format']) => {
  if (format) return format;
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.dat') return 'dat';
  return 'csv';
};

const DEFAULT_COLUMNS = {
  employeeCode: 'employeeCode',
  deviceId: 'deviceId',
  timestamp: 'timestamp'
};

export const parseClockingFile = async (
  filePath: string,
  options: ClockingParserOptions,
  onRow: (row: ParsedClockingRow) => Promise<void> | void
) => {
  const format = resolveFormat(filePath, options.format);
  const columns = { ...DEFAULT_COLUMNS, ...options.columns };

  if (format === 'csv') {
    await parseCsvFile(filePath, options.delimiter ?? ',', columns, options.timezone, onRow);
  } else {
    await parseDatFile(filePath, options.delimiter ?? '|', columns, options.timezone, onRow);
  }
};

const parseCsvFile = async (
  filePath: string,
  delimiter: string,
  columns: Record<string, string>,
  timezone: string | undefined,
  onRow: (row: ParsedClockingRow) => Promise<void> | void
) => {
  return new Promise<void>((resolve, reject) => {
    const stream = fs
      .createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          delimiter,
          trim: true,
          skipEmptyLines: true
        })
      );

    stream.on('data', (record: Record<string, string>) => {
      const normalized = toParsedRow(record, columns, timezone);
      if (normalized) {
        Promise.resolve(onRow(normalized)).catch(reject);
      }
    });

    stream.on('end', () => resolve());
    stream.on('error', (error) => reject(error));
  });
};

const parseDatFile = async (
  filePath: string,
  delimiter: string,
  columns: Record<string, string>,
  timezone: string | undefined,
  onRow: (row: ParsedClockingRow) => Promise<void> | void
) => {
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  const seenMinuteKeys = new Set<string>();

  for await (const rawLine of rl) {
    const line = rawLine.trim();
    if (!line) continue;

    const tokens = tokenizeDatLine(line, delimiter);
    if (tokens.length < 2) continue;

    const badge = tokens[0];
    if (!badge) continue;

    const { timestampText, deviceId, extras } = extractDatFields(tokens);
    if (!timestampText) continue;

    const record: Record<string, string> = {
      [columns.employeeCode]: badge,
      [columns.deviceId]: deviceId,
      [columns.timestamp]: timestampText,
      rawLine
    };

    if (extras.length) {
      record.extras = extras.join(' ');
    }

    const normalized = toParsedRow(record, columns, timezone);
    if (!normalized) continue;

    const minuteKey = buildMinuteKey(normalized.employeeCode, normalized.deviceId, normalized.clockedAt);
    if (seenMinuteKeys.has(minuteKey)) {
      continue;
    }
    seenMinuteKeys.add(minuteKey);

    await onRow(normalized);
  }
};

const tokenizeDatLine = (line: string, delimiter?: string) => {
  if (delimiter && line.includes(delimiter)) {
    return line.split(delimiter).map((value) => value.trim());
  }
  return line.split(/\s+/).map((value) => value.trim());
};

const extractDatFields = (tokens: string[]) => {
  const hasSplitDateTime = tokens.length >= 3 && tokens[1].includes('-') && tokens[2].includes(':');
  const timestampText = hasSplitDateTime ? `${tokens[1]} ${tokens[2]}` : tokens[1] ?? '';
  const deviceIndex = hasSplitDateTime ? 3 : 2;
  const deviceId = tokens[deviceIndex] && tokens[deviceIndex] !== '' ? tokens[deviceIndex] : 'default';
  const extrasStart = hasSplitDateTime ? 4 : 3;
  const extras = tokens.length > extrasStart ? tokens.slice(extrasStart) : [];

  return { timestampText, deviceId, extras };
};

const buildMinuteKey = (employeeCode: string, deviceId: string, clockedAt: Date) => {
  const minuteSlice = clockedAt.toISOString().slice(0, 16);
  return `${employeeCode}::${deviceId}::${minuteSlice}`;
};

const toParsedRow = (
  record: Record<string, string>,
  columns: Record<string, string>,
  timezone?: string
): ParsedClockingRow | null => {
  const employeeCode = record[columns.employeeCode];
  const deviceId = record[columns.deviceId] ?? 'unknown';
  const timestamp = record[columns.timestamp];

  if (!employeeCode || !timestamp) return null;

  const clockedAt = buildClockedAt(timestamp, timezone);
  if (!clockedAt) return null;

  return {
    employeeCode,
    deviceId,
    clockedAt,
    raw: record
  };
};

const buildClockedAt = (timestamp: string, timezone?: string) => {
  const normalized = timestamp.replace(' ', 'T');
  if (timezone) {
    try {
      return fromZonedTime(normalized, timezone);
    } catch (error) {
      // fall through to default parsing below
    }
  }
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};
