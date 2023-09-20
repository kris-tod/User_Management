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

  async update(req, res) {
    const { password } = req.body;
    const id = req.params[this.identityName];
    const { user } = req;

    const updatedData = await this.service.updateUserPassword(id, { password }, user);
    res.status(200).json(updatedData);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'update', 'create', 'destroy']);
  }
}
