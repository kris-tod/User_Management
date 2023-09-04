import FileService from '../../services/FileService.js';

import {
  ADDED_FRIEND,
  REMOVED_FRIEND
} from '../../constants/messages.js';
import { BaseController } from './BaseController.js';
import { UserService } from '../../services/UserService.js';

export class EndUserController extends BaseController {
  constructor() {
    super(UserService);
  }

  async getOne(req, res) {
    const id = req.userId;

    const user = await this.service.getOne(id);
    res.status(200).json(user);
  }

  async addFriend(req, res) {
    const id = req.userId;
    const { friendUsername } = req.body;

    await this.service.addFriend(id, friendUsername);
    res.status(200).json({
      message: ADDED_FRIEND
    });
  }

  async updateAvatar(req, res, next) {
    const id = req.userId;
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

  async removeFriend(req, res) {
    const id = req.userId;
    const { friendUsername } = req.body;

    await this.service.removeFriend(id, friendUsername);
    res.status(200).json({
      message: REMOVED_FRIEND
    });
  }

  async update(req, res) {
    const id = req.userId;

    const result = await this.service.update(id, req.body);

    res.status(201).json(result);
  }
}
