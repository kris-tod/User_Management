import { SUBSCRIPTION_PLAN_NOT_FOUND } from '../../constants/messages.js';
import { SubscriptionPlan as SubscriptionPlanModel } from '../../db/index.js';
import { BaseRepo } from '../../utils/BaseRepo.js';
import { NotFoundError, ApiError } from '../../utils/errors.js';
import { SubscriptionPlan } from './SubscriptionPlan.js';

export class SubscriptionPlanRepository extends BaseRepo {
  constructor() {
    super(SubscriptionPlanModel);
  }

  buildEntity(model) {
    return new SubscriptionPlan(
      parseInt(model.id, 10),
      model.name,
      model.price,
      model.commissionPerRequest,
      model.carsLimit,
      model.isDefault,
      model.description
    );
  }

  async getAll(page = 1, options = {}) {
    const {
      total, data, limit, offset
    } = await super.getAll(page, ['name'], options);

    return {
      total, limit, offset, data
    };
  }

  async getOne(id) {
    const entity = await super.getOne(id);
    if (!entity) {
      throw new NotFoundError(SUBSCRIPTION_PLAN_NOT_FOUND);
    }
    return entity;
  }

  async destroy(id) {
    const entity = await this.getOne(id);
    if (entity.isDefault) {
      throw new ApiError('Plan is default!');
    }

    await super.destroy(id);
  }
}
