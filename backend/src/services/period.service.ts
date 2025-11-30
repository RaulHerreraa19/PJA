import { Period, PeriodCreationAttributes } from '../database/models';
import { AppError } from '../utils/errors';

class PeriodService {
  list() {
    return Period.findAll({ order: [['startDate', 'DESC']] });
  }

  create(payload: PeriodCreationAttributes) {
    return Period.create(payload);
  }

  async close(id: string) {
    const period = await Period.findByPk(id);
    if (!period) throw new AppError('Period not found', 404);
    return period.update({ status: 'closed' });
  }
}

export const periodService = new PeriodService();
