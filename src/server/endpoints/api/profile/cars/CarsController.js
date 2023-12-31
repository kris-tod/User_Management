import { CarService } from '../../../../../domain/car/CarService.js';
import { BaseController } from '../../../../../utils/BaseController.js';

export class CarsController extends BaseController {
  constructor(logger) {
    super(new CarService(logger), logger);
  }

  async getMany(req, res) {
    const { user } = req;

    const collection = await this.service.getAll(user);
    res.status(200).json(collection);
  }

  async updateImage(req, res) {
    const { id } = req.params;
    const { file } = req;

    const response = await this.service.updateImage(id, file);
    res.status(200).json(response);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'getOne', 'create', 'update', 'destroy', 'updateImage']);
  }
}
