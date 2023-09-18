import { UserService } from '../../../../domain/user/UserService.js';
import { BaseController } from '../../../../utils/BaseController.js';
import { serializeUser, serializeUsers } from '../../serialize.js';

export class UsersController extends BaseController {
  constructor(logger) {
    super(new UserService(logger), logger);
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

    const updatedData = await this.service.updateUserPassword(id, { password }, user);
    res.status(200).json(updatedData);
  }

  async create(req, res) {
    const data = req.body;
    const { user } = req;

    const entity = await this.service.create(data, user);
    res.status(201).json(serializeUser(entity));
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'update', 'create', 'destroy']);
  }
}
