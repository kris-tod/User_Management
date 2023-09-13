import { TireService } from '../../../../../../domain/user/car/tire/TireService.js';
import { BaseController } from '../../../../../../utils/BaseController.js';

export class TiresController extends BaseController {
  constructor(logger) {
    super(new TireService(logger), logger);
  }

  async getMany(req, res) {
    const { id } = req.params;

    const collection = await this.service.getAll(id);
    res.status(200).json(collection);
  }

  async getOne(req, res) {
    const { tireId } = req.params;

    const entity = await this.service.getOne(tireId);
    res.status(200).json(entity);
  }

  async create(req, res) {
    const { id } = req.params;
    const data = req.body;

    const response = await this.service.create(id, data);
    res.status(200).json(response);
  }

  async update(req, res) {
    const { tireId } = req.params;
    const data = req.body;

    const response = await this.service.update(tireId, data);
    res.status(200).json(response);
  }

  async destroy(req, res) {
    const { tireId } = req.params;

    await this.service.destroy(tireId);
    res.status(200).send('');
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'getOne', 'create', 'update', 'destroy']);
  }
}
