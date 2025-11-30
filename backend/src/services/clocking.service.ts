import { RawClocking } from '../database/models';

class ClockingService {
  list(status?: string) {
    return RawClocking.findAll({
      where: status ? { status } : undefined,
      order: [['clockedAt', 'DESC']]
    });
  }
}

export const clockingService = new ClockingService();
