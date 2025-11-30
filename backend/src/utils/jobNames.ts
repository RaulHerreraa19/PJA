export const JOBS = {
  IMPORT_CLOCKINGS: 'import-clockings'
} as const;

type ValueOf<T> = T[keyof T];

export type JobName = ValueOf<typeof JOBS>;
