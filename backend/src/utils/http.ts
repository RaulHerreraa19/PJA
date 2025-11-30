import { Response } from 'express';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
}

export const ok = <T>(res: Response, data: T, meta?: ApiResponse<T>['meta']) =>
  res.json({ status: 'success', data, meta });

export const created = <T>(res: Response, data: T) => res.status(201).json({ status: 'success', data });

export const noContent = (res: Response) => res.status(204).send();

export const fail = (res: Response, message: string, status = 400, meta?: Record<string, unknown>) =>
  res.status(status).json({ status: 'error', error: message, meta });
