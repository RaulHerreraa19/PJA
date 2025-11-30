import ExcelJS from 'exceljs';
import puppeteer from 'puppeteer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AttendanceComputed, Employee, Department, Position } from '../database/models';

interface ReportFilters {
  periodId: string;
  departmentId?: string;
  positionId?: string;
  employeeId?: string;
  status?: string;
}

class ReportService {
  async generatePeriodReport(filters: ReportFilters) {
    const records = await AttendanceComputed.findAll({
      where: {
        periodId: filters.periodId,
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.status ? { status: filters.status } : {})
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          include: [
            {
              model: Department,
              as: 'department',
              where: filters.departmentId ? { id: filters.departmentId } : undefined,
              required: Boolean(filters.departmentId)
            },
            {
              model: Position,
              as: 'position',
              where: filters.positionId ? { id: filters.positionId } : undefined,
              required: Boolean(filters.positionId)
            }
          ]
        }
      ],
      order: [['date', 'ASC']]
    });

    const excel = await this.toExcel(records);
    const pdf = await this.toPdf(records);

    return { excel, pdf };
  }

  private async toExcel(records: AttendanceComputed[]) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Asistencias');
    sheet.columns = [
      { header: 'Empleado', key: 'employee', width: 40 },
      { header: 'Fecha', key: 'date', width: 18 },
      { header: 'Entrada', key: 'checkIn', width: 24 },
      { header: 'Salida', key: 'checkOut', width: 24 },
      { header: 'Estatus', key: 'status', width: 18 },
      { header: 'Minutos', key: 'minutes', width: 12 }
    ];

    records.forEach((record) => {
      sheet.addRow({
        employee: `${record.employee?.firstName ?? ''} ${record.employee?.lastName ?? ''}`.trim(),
        date: this.formatDate(record.date),
        checkIn: this.formatDateTime(record.checkIn),
        checkOut: this.formatDateTime(record.checkOut),
        status: this.translateStatus(record.status),
        minutes: record.totalMinutes ?? 0
      });
    });

    const output = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(output) ? output : Buffer.from(output);
  }

  private async toPdf(records: AttendanceComputed[]) {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(this.buildHtml(records));
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return pdf;
  }

  private buildHtml(records: AttendanceComputed[]) {
    const rows = records
      .map(
        (record) => `
        <tr>
          <td>${record.employee?.firstName ?? ''} ${record.employee?.lastName ?? ''}</td>
          <td>${this.formatDate(record.date)}</td>
          <td>${this.formatDateTime(record.checkIn)}</td>
          <td>${this.formatDateTime(record.checkOut)}</td>
          <td>${this.translateStatus(record.status)}</td>
          <td>${record.totalMinutes ?? 0}</td>
        </tr>`
      )
      .join('');

    return `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; }
            th { background: #f5f5f5; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <h1>Reporte de asistencia</h1>
          <table>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Fecha</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Estatus</th>
                <th>Minutos</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>`;
  }

  private formatDate(dateValue?: string) {
    if (!dateValue) {
      return '-';
    }
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? dateValue : format(date, 'dd/MM/yyyy', { locale: es });
  }

  private formatDateTime(dateValue?: Date | null) {
    if (!dateValue) {
      return '-';
    }
    return format(dateValue, 'dd/MM/yyyy HH:mm:ss', { locale: es });
  }

  private translateStatus(status: AttendanceComputed['status']) {
    const map: Record<AttendanceComputed['status'], string> = {
      present: 'Presente',
      absent: 'Ausente',
      late: 'Retardo',
      leave: 'Permiso'
    };
    return map[status] ?? status;
  }
}

export const reportService = new ReportService();
