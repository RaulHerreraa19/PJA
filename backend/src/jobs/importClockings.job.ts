import { createQueue } from '../config/redis';
import { JOBS } from '../utils/jobNames';

export interface ImportJobPayload {
  filePath: string;
  originalName: string;
  uploadedBy: string;
  format?: 'csv' | 'dat';
}

export const importClockingsQueue = createQueue(JOBS.IMPORT_CLOCKINGS);

export const enqueueImport = async (payload: ImportJobPayload) =>
  importClockingsQueue.add(JOBS.IMPORT_CLOCKINGS, payload, {
    removeOnComplete: true,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  });
