import { UserService } from '../../../../domain/user/UserService.js';
import { BaseController } from '../../../../utils/BaseController.js';
import { serializeUsers } from '../../serialize.js';

export class UsersController extends BaseController {
  constructor(logger) {
    super(new UserService(logger), logger);
  }

  async getMany(req, res) {
    const { page } = req.query;

    const collection = await this.service.getAll(page);
    res.status(200).json(serializeUsers(collection));
  }

  async update(req, res) {
    const { password } = req.body;
    const id = req.params[this.identityName];

    const updatedData = await this.service.update(id, { password });
    res.status(200).json(updatedData);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'update', 'create', 'destroy']);
  }
}
