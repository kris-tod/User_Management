import { BaseController } from '../../../../utils/BaseController.js';
import { OrganizationService } from '../../../../domain/organizations/OrganizationService.js';

export class SubscriptionPlansController extends BaseController {
  constructor(logger) {
    super(new OrganizationService(logger), logger);
  }

  async getMany(req, res) {
    const { page } = req.query;
    const { user } = req;

    const collection = await this.service.getAllSubscriptionPlans(page, user);
    res.status(200).json(collection);
  }

  async getOne(req, res) {
    const { id } = req.params;
    const { user } = req;

    const entity = await this.service.getOneSubscriptionPlan(id, user);
    res.status(200).json(entity);
  }

  async create(req, res) {
    const { user } = req;
    const data = req.body;

    const response = await this.service.createSubscriptionPlan(data, user);
    res.status(200).json(response);
  }

  async update(req, res) {
    const { user } = req;
    const { id } = req.params;
    const data = req.body;

    const response = await this.service.updateSubscriptionPlan(id, data, user);
    res.status(200).json(response);
  }

  async destroy(req, res) {
    const { user } = req;
    const { id } = req.params;

    const response = await this.service.destroySubscriptionPlan(id, user);
    res.status(200).json(response);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'getOne', 'create', 'update', 'destroy']);
  }
}
