import { USER_LOGGED_IN, USER_LOGGED_OUT } from '../../../../constants/messages.js';

import { authCookieName } from '../../../../config/index.js';
import { UserService } from '../../../../services/UserService.js';

export class AuthController {
  constructor() {
    this.authService = UserService;
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

  createRouterHandlers(methods) {
    const handlers = {};

    if (methods.includes('login')) {
      handlers.login = this.login.bind(this);
    }
    if (methods.includes('logout')) {
      handlers.logout = this.logout.bind(this);
    }

    return handlers;
  }
}
