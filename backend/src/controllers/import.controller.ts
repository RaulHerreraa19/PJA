import { Request, Response } from 'express';
import { importService } from '../services/import.service';
import { AppError } from '../utils/errors';
import { created } from '../utils/http';

export const uploadClockingsFile = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('File is required', 400);
  }
  if (!req.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const result = await importService.handleUpload({
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    userId: req.auth.userId,
    format: req.body.format as 'csv' | 'dat' | undefined
  });

  return created(res, { queued: true, filePath: result.filePath });
};
