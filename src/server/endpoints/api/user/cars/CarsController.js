import { CarService } from '../../../../../domain/user/car/CarService.js';
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

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'getOne', 'create', 'update', 'destroy']);
  }
}
