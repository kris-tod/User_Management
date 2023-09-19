import { UserService } from '../../../../domain/user/UserService.js';

import { BaseController } from '../../../../utils/BaseController.js';

export class ProfileController extends BaseController {
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

  async getOne(req, res) {
    const { id } = req.user;

    const entity = await this.service.getOne(id);
    res.status(200).json(this.serializeEntity(entity));
  }

  async update(req, res) {
    const { id } = req.user;
    const { user } = req;

    const updatedData = await this.service.update(id, req.body, user);
    res.status(201).json(updatedData);
  }

  async updateAvatar(req, res) {
    const { id } = req.user;
    const { file, filePath } = req;

    const response = await this.service.updateAvatarById(id, filePath, file);
    res.status(200).json(response);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getOne', 'update', 'updateAvatar']);
  }
}
