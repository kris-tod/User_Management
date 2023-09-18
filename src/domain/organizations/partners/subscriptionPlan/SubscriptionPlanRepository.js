import { SUBSCRIPTION_PLAN_NOT_FOUND } from '../../../../constants/messages.js';
import { SubscriptionPlan as SubscriptionPlanModel } from '../../../../db/index.js';
import { BaseRepo } from '../../../../utils/BaseRepo.js';
import { NotFoundError } from '../../../../utils/errors.js';
import { SubscriptionPlan } from './SubscriptionPlan.js';

const buildSubscriptionPlan = (model) => new SubscriptionPlan(
  parseInt(model.id, 10),
  model.name,
  model.price,
  model.commissionPerRequest,
  model.carsLimit,
  model.isDefault,
  model.description
);

export class SubscriptionPlanRepository extends BaseRepo {
  constructor() {
    super(SubscriptionPlanModel);
  }

  async getAll(page = 1) {
    const collection = await super.getAll(page, ['name']);

    return collection.map((entity) => buildSubscriptionPlan(entity));
  }

  async getOne(id) {
    const entity = await super.getOne(id);
    if (!entity) {
      throw new NotFoundError(SUBSCRIPTION_PLAN_NOT_FOUND);
    }
    return buildSubscriptionPlan(entity);
  }
}
