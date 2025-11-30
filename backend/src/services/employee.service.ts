import { Employee, Department, Position, Schedule, EmployeeCreationAttributes, EmployeeAttributes } from '../database/models';
import { AppError } from '../utils/errors';

class EmployeeService {
  list() {
    return Employee.findAll({
      include: [
        { model: Department, as: 'department' },
        { model: Position, as: 'position' },
        { model: Schedule, as: 'schedule' }
      ]
    });
  }

  async create(payload: EmployeeCreationAttributes) {
    const exists = await Employee.findOne({ where: { employeeCode: payload.employeeCode } });
    if (exists) {
      throw new AppError('Employee already exists', 409);
    }
    return Employee.create(payload);
  }

  async update(id: string, payload: Partial<EmployeeAttributes>) {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }
    return employee.update(payload);
  }

  async remove(id: string) {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }
    await employee.destroy();
  }
}

export const employeeService = new EmployeeService();
