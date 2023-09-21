import { SubscriptionPlan as SubscriptionPlanModel } from '../../db/index.js';
import { BaseRepo } from '../../utils/BaseRepo.js';
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
}
