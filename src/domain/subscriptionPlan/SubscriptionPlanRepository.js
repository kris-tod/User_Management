import { SUBSCRIPTION_PLAN_NOT_FOUND } from '../../constants/messages.js';
import { SubscriptionPlan as SubscriptionPlanModel } from '../../db/index.js';
import { BaseRepo } from '../../utils/BaseRepo.js';
import { NotFoundError } from '../../utils/errors.js';
import { SubscriptionPlan } from './SubscriptionPlan.js';

export class SubscriptionPlanRepository extends BaseRepo {
  constructor() {
    super(SubscriptionPlanModel);
  }

  buildEntity(model) {
    return new SubscriptionPlan(
      model.id,
      model.name,
      model.price,
      model.commissionPerRequest,
      model.carsLimit,
      model.isDefault,
      model.description
    );
  }

  async getOne(id, options = {}) {
    const entity = await super.getOne(id, options);
    if (!entity) {
      throw new NotFoundError(SUBSCRIPTION_PLAN_NOT_FOUND);
    }
    return entity;
  }
}
