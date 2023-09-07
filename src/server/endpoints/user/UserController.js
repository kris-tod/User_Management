import FileService from '../../../domain/services/FileService.js';
import { UserService } from '../../../domain/user/UserService.js';

import { BaseController } from '../../../utils/BaseController.js';

export class UserController extends BaseController {
  constructor(logger) {
    super(new UserService(logger));
    this.logger = logger;
  }

  async getOne(req, res) {
    const { id } = req.user;

    const entity = await this.service.getOne(id);
    res.status(200).json(entity);
  }

  async updateAvatar(req, res, next) {
    const { id } = req.user;
    const { filePath, file } = req;

    try {
      await this.service.updateAvatarById(id, filePath);

      res.status(200).json({
        avatar: filePath
      });
    }
    catch (err) {
      FileService.deleteFile(file);
      next(err);
    }
  }

  async update(req, res) {
    const { id } = req.user;

    const updatedData = await this.service.update(id, req.body);
    res.status(201).json(updatedData);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getOne', 'update', 'updateAvatar']);
  }
}
