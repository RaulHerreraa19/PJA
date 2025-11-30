import path from 'path';
import fs from 'fs';
import env from '../config/env';
import { enqueueImport } from '../jobs/importClockings.job';

class ImportService {
  async handleUpload({
    buffer,
    originalName,
    userId,
    format
  }: {
    buffer: Buffer;
    originalName: string;
    userId: string;
    format?: 'csv' | 'dat';
  }) {
    const filePath = path.join(env.FILE_UPLOAD_DIR, `${Date.now()}-${originalName}`);
    await fs.promises.writeFile(filePath, buffer);

    await enqueueImport({ filePath, originalName, uploadedBy: userId, format });

    return { filePath };
  }
}

export const importService = new ImportService();
