import { NextFunction, Request, Response } from 'express';
import { AuditLog } from '../database/models/AuditLog';

export const auditMiddleware = (action: string, entity?: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', async () => {
      if (!req.auth?.userId) return;
      await AuditLog.create({
        userId: req.auth.userId,
        action,
        entity: entity ?? req.baseUrl,
        entityId: req.params.id,
        details: JSON.stringify({ body: req.body, query: req.query }),
        ipAddress: req.ip
      });
    });

    next();
  };
