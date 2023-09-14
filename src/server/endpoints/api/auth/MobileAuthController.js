import { USER_LOGGED_OUT } from '../../../../constants/messages.js';

import { authCookieName } from '../../../../config/index.js';
import { BaseController } from '../../../../utils/BaseController.js';
import { UserService } from '../../../../domain/user/UserService.js';
import { serializeUser } from '../../serialize.js';

export class MobileAuthController {
  constructor(logger) {
    this.authService = new UserService(logger);
    this.logger = logger;
  }

  async register(req, res) {
    const {
      username, password, email, region
    } = req.body;

    const entity = await this.authService.register({
      username, password, email, region
    });
    res.status(200).json(serializeUser(entity));
  }

  async login(req, res) {
    const { username, password } = req.body;

    const { token } = await this.authService.loginMobileUser(username, password);
    res.cookie(authCookieName, token).status(200).json({
      token
    });
  }

  async logout(req, res) {
    const token = req.cookies[authCookieName];

    await this.authService.logout(token);
    res.clearCookie(authCookieName).status(200).json(USER_LOGGED_OUT);
  }

  createRouterHandlers() {
    return BaseController.prototype.createRouterHandlers.call(this, ['login', 'logout', 'register']);
  }
}
