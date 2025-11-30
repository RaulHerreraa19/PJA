import { Department, DepartmentCreationAttributes, Position, PositionCreationAttributes, Schedule, ScheduleCreationAttributes } from '../database/models';
import { AppError } from '../utils/errors';

class CatalogsService {
  listDepartments() {
    return Department.findAll({ order: [['name', 'ASC']] });
  }

  async createDepartment(payload: DepartmentCreationAttributes) {
    return Department.create(payload);
  }

  async updateDepartment(id: string, payload: Partial<DepartmentCreationAttributes>) {
    const department = await Department.findByPk(id);
    if (!department) {
      throw new AppError('Department not found', 404);
    }
    return department.update(payload);
  }

  async removeDepartment(id: string) {
    const department = await Department.findByPk(id);
    if (!department) {
      throw new AppError('Department not found', 404);
    }
    await department.destroy();
  }

  listPositions() {
    return Position.findAll({
      include: [{ model: Department, as: 'department' }],
      order: [['name', 'ASC']],
    });
  }

  createPosition(payload: PositionCreationAttributes) {
    return Position.create(payload);
  }

  async updatePosition(id: string, payload: Partial<PositionCreationAttributes>) {
    const position = await Position.findByPk(id);
    if (!position) {
      throw new AppError('Position not found', 404);
    }
    return position.update(payload);
  }

  async removePosition(id: string) {
    const position = await Position.findByPk(id);
    if (!position) {
      throw new AppError('Position not found', 404);
    }
    await position.destroy();
  }

  listSchedules() {
    return Schedule.findAll({ order: [['name', 'ASC']] });
  }

  createSchedule(payload: ScheduleCreationAttributes) {
    return Schedule.create(payload);
  }

  async updateSchedule(id: string, payload: Partial<ScheduleCreationAttributes>) {
    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }
    return schedule.update(payload);
  }

  async removeSchedule(id: string) {
    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }
    await schedule.destroy();
  }
}

export const catalogsService = new CatalogsService();
