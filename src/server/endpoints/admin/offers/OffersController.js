import { RequestService } from '../../../../domain/request/RequestService.js';
import { BaseController } from '../../../../utils/BaseController.js';

export class OffersController extends BaseController {
  constructor(logger) {
    super(new RequestService(logger), logger);
  }

  async getMany(req, res) {
    const { user } = req;
    const { page } = req.query;

    const response = await this.service.getAllOffers(page, user);
    res.status(200).json(response);
  }

  async getOne(req, res) {
    const { id } = req.params;
    const { user } = req;

    const entity = await this.service.getOneOffer(id, user);
    res.status(200).json(entity);
  }

  async create(req, res) {
    const data = req.body;
    const { user } = req;

    const response = await this.service.createOffer(data, user);
    res.status(201).json(response);
  }

  async update(req, res) {
    const updatedData = req.body;
    const { user } = req;
    const { id } = req.params;

    const response = await this.service.updateOffer(id, updatedData, user);
    res.status(200).json(response);
  }

  async destroy(req, res) {
    const { id } = req.params;
    const { user } = req;

    await this.service.destroyOffer(id, user);
    res.status(200).send('');
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'getOne', 'create', 'update', 'destroy']);
  }
}
