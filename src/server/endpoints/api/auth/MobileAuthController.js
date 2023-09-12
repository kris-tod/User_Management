import { USER_LOGGED_OUT } from '../../../../constants/messages.js';

import { authCookieName } from '../../../../config/index.js';
import { BaseController } from '../../../../utils/BaseController.js';
import { createUserService } from '../../../../domain/user/UserService.js';
import { serializeUser } from '../../serialize.js';
import { apps } from '../../../../constants/apps.js';

export class MobileAuthController {
  constructor(logger) {
    const MobileUserService = createUserService(apps.mobile);
    this.authService = new MobileUserService(logger);
    this.logger = logger;
  }

  async register(req, res) {
    const { username, password, email } = req.body;

    const entity = await this.authService.create({ username, password, email });

    res.status(200).json(serializeUser(entity));
  }

  async login(req, res) {
    const { username, password } = req.body;

    const { token } = await this.authService.loginUser(username, password);

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
