import { USER_LOGGED_IN, USER_LOGGED_OUT } from '../../../constants/messages.js';

import { authCookieName } from '../../../config/index.js';
import { UserService } from '../../../services/UserService.js';
import { BaseController } from '../../../utils/BaseController.js';

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async login(req, res) {
    const { username, password } = req.body;

    const { user, token } = await this.authService.loginUser(username, password);

    res.cookie(authCookieName, token).status(200).json({
      message: USER_LOGGED_IN
    });
  }

  async logout(req, res) {
    const token = req.cookies[authCookieName];

    await this.authService.logout(token);
    res.clearCookie(authCookieName).status(200).json({
      message: USER_LOGGED_OUT
    });
  }

  createRouterHandlers() {
    return BaseController.prototype.createRouterHandlers.call(this, ['login', 'logout']);
  }
}
