import { UserService } from '../../../domain/user/UserService.js';
import { BaseController } from '../../../utils/BaseController.js';

export class FriendsController {
  constructor(logger) {
    this.service = new UserService(logger);
    this.logger = logger;
  }

  async addFriend(req, res) {
    const { id } = req.user;
    const { friendUsername } = req.body;

    await this.service.addFriend(id, friendUsername);
    res.status(200).json({
      friendUsername
    });
  }

  async removeFriend(req, res) {
    const { id } = req.user;
    const { friendUsername } = req.body;

    await this.service.removeFriend(id, friendUsername);
    res.status(200).json({});
  }

  createRouterHandlers() {
    return BaseController.prototype.createRouterHandlers.call(this, ['addFriend', 'removeFriend']);
  }
}
