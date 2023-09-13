import { UsersService } from '../../../../domain/user/UsersService.js';
import { BaseController } from '../../../../utils/BaseController.js';
import { serializeUsers } from '../../serialize.js';

export class UsersController extends BaseController {
  constructor(logger) {
    super(new UsersService(logger), logger);
  }

  async getMany(req, res) {
    const { page } = req.query;
    const { user } = req;

    const collection = await this.service.getAll(page, user);
    res.status(200).json(serializeUsers(collection));
  }

  async update(req, res) {
    const { password } = req.body;
    const id = req.params[this.identityName];
    const { user } = req;

    const updatedData = await this.service.update(id, { password }, user);
    res.status(200).json(updatedData);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'update', 'create', 'destroy']);
  }
}
