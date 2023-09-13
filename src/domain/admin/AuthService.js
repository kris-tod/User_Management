import { UserRepository } from '../user/UserRepository.js';
import { AdminRepository } from './AdminRepository.js';
import { roles } from '../user/User.js';
import { ApiError, InternalError, NotFoundError } from '../../utils/errors.js';
import { apps } from '../../constants/apps.js';
import {
  INVALID_REGION, DEFAULT_ERROR_MESSAGE, USER_NOT_FOUND, PASSWORD_INCORRECT
} from '../../constants/messages.js';
import PasswordService from '../services/passwordService.js';
import { TokenBlacklistRepository } from '../user/tokenBlacklist/TokenBlacklistRepository.js';
import { createToken } from '../../utils/jwt.js';

export class AuthService {
  constructor(logger) {
    this.userRepo = new UserRepository();
    this.adminRepo = new AdminRepository();
    this.tokenBlacklistRepo = new TokenBlacklistRepository();
    this.logger = logger;
  }

  async register({
    username, password, email, region
  }, reqUser) {
    this.logger.log('info', 'create user');

    if (reqUser.role === roles.admin && reqUser.region !== region) {
      throw new ApiError(INVALID_REGION);
    }

    const hash = await PasswordService.hashPassword(password);
    await this.userRepo.create({
      username,
      email,
      password: hash,
      region
    });

    const entity = await this.userRepo.getOneByUsername(username);

    if (!entity) {
      throw new InternalError(DEFAULT_ERROR_MESSAGE);
    }

    return entity;
  }

  async loginWebUser(username, password) {
    this.logger.log('info', 'login web user');
    const user = await this.adminRepo.getOneByUsername(username);

    if (!user) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    const match = await PasswordService.comparePasswords(
      password,
      user.password
    );

    if (!match) {
      throw new ApiError(PASSWORD_INCORRECT);
    }

    const token = createToken({
      id: user.id,
      role: user.role,
      app: apps.web,
      region: user.region
    });

    return {
      user,
      token
    };
  }

  async loginMobileUser(username, password) {
    this.logger.log('info', 'login mobile user');
    const user = await this.userRepo.getOneByUsername(username);

    if (!user) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    const match = await PasswordService.comparePasswords(
      password,
      user.password
    );

    if (!match) {
      throw new ApiError(PASSWORD_INCORRECT);
    }

    const token = createToken({
      id: user.id,
      role: roles.endUser,
      app: apps.mobile,
      region: user.region
    });

    return {
      user,
      token
    };
  }

  async logout(token) {
    this.logger.log('info', 'logout');
    await this.tokenBlacklistRepo.create({ token });
  }
}
