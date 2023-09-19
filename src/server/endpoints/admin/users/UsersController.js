import { UserService } from '../../../../domain/user/UserService.js';
import { BaseController } from '../../../../utils/BaseController.js';

export class UsersController extends BaseController {
  constructor(logger) {
    super(new UserService(logger), logger);
  }

  serializeEntity({
    id,
    username,
    email,
    avatar,
    role,
    friendsList = [],
    region,
    cars = [],
    favouritePartners = []
  }) {
    return {
      id,
      username,
      email,
      avatar,
      role,
      friendsList,
      region,
      cars,
      favouritePartners: favouritePartners.map((partner) => partner.name)
    };
  }

  async getMany(req, res) {
    const { page } = req.query;
    const { user } = req;

    const {
      total, data, limit, offset
    } = await this.service.getAll(page, user);
    res.status(200).json({
      total, limit, offset, data: data.map((entity) => this.serializeEntity(entity))
    });
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
    res.status(201).json(this.serializeEntity(entity));
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'update', 'create', 'destroy']);
  }
}
