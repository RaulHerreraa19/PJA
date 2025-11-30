import { Request, Response } from 'express';
import { reportService } from '../services/report.service';
import { ok } from '../utils/http';

export const generatePeriodReport = async (req: Request, res: Response) => {
  const { excel, pdf } = await reportService.generatePeriodReport(req.body);
  return ok(res, {
    excel: Buffer.from(excel).toString('base64'),
    pdf: Buffer.from(pdf).toString('base64'),
    excelMime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdfMime: 'application/pdf'
  });
};
