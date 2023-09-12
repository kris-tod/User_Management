import { UserService } from '../../../../domain/user/UserService.js';
import { serializeUser } from '../../serialize.js';

import { BaseController } from '../../../../utils/BaseController.js';

export class UserController extends BaseController {
  constructor(logger) {
    super(new UserService(logger), logger);
  }

  async getOne(req, res) {
    const { id } = req.user;

    const entity = await this.service.getOne(id);
    res.status(200).json(serializeUser(entity));
  }

  async updateAvatar(req, res) {
    const { id } = req.user;
    const { filePath, file } = req;

    const response = await this.service.updateAvatarById(id, filePath, file);
    res.status(200).json(response);
  }

  async update(req, res) {
    const { id } = req.user;
    const { user } = req;

    const updatedData = await this.service.update(id, req.body, user);
    res.status(201).json(updatedData);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getOne', 'update', 'updateAvatar']);
  }
}
