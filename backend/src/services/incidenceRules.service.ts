import { IncidenceRule, IncidenceRuleCreationAttributes } from '../database/models';
import { AppError } from '../utils/errors';

class IncidenceRulesService {
  list() {
    return IncidenceRule.findAll();
  }

  create(payload: IncidenceRuleCreationAttributes) {
    return IncidenceRule.create(payload);
  }

  async update(id: string, payload: Partial<IncidenceRuleCreationAttributes>) {
    const rule = await IncidenceRule.findByPk(id);
    if (!rule) {
      throw new AppError('Incidence rule not found', 404);
    }
    return rule.update(payload);
  }

  async remove(id: string) {
    const rule = await IncidenceRule.findByPk(id);
    if (!rule) {
      throw new AppError('Incidence rule not found', 404);
    }
    await rule.destroy();
  }
}

export const incidenceRulesService = new IncidenceRulesService();
