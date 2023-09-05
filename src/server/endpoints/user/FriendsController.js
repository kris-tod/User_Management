import { ADDED_FRIEND, REMOVED_FRIEND } from '../../../constants/messages.js';
import { BaseController } from '../../../utils/BaseController.js';

export class FriendsController {
  constructor(service) {
    this.service = service;
  }

  async addFriend(req, res) {
    const { id } = req.user;
    const { friendUsername } = req.body;

    await this.service.addFriend(id, friendUsername);
    res.status(200).json({
      message: ADDED_FRIEND
    });
  }

  async removeFriend(req, res) {
    const { id } = req.user;
    const { friendUsername } = req.body;

    await this.service.removeFriend(id, friendUsername);
    res.status(200).json({
      message: REMOVED_FRIEND
    });
  }

  createRouterHandlers() {
    return BaseController.prototype.createRouterHandlers.call(this, ['addFriend', 'removeFriend']);
  }
}
