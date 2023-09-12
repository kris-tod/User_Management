import PasswordService from '../services/passwordService.js';
import { sequelize } from '../../models/db.js';

import { createToken } from '../../utils/jwt.js';

import {
  INVALID_FRIENDS_IDS,
  PASSWORD_INCORRECT,
  USER_NOT_FOUND,
  DEFAULT_ERROR_MESSAGE,
  USER_NOT_END_USER,
  USER_NOT_ADMIN
} from '../../constants/messages.js';

import { UserRepository } from './UserRepository.js';
import { TokenBlacklistRepository } from './tokenBlacklist/TokenBlacklistRepository.js';
import {
  ApiError, AuthError, ForbiddenError, InternalError, NotFoundError
} from '../../utils/errors.js';
import { roles } from './User.js';
import { apps } from '../../constants/apps.js';
import FileService from '../services/FileService.js';

export class UserService {
  constructor(logger) {
    this.userRepo = new UserRepository();
    this.tokenBlacklistRepo = new TokenBlacklistRepository();
    this.logger = logger;
  }

  async getAll(pageParam) {
    this.logger.log('info', 'getall users');

    let page = pageParam || 1;
    if (page <= 0) {
      page = 1;
    }

    const collection = await this.userRepo.getAll(page);
    return collection;
  }

  async getOne(id) {
    this.logger.log('info', 'getone user');

    const user = await this.userRepo.getOne(id);

    if (!user) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    return user;
  }

  async updateFriends(id, friendsIds, t) {
    this.logger.log('info', 'addfriend');
    const user = await this.userRepo.getOne(id);

    if (!user.isEndUser()) {
      throw new ForbiddenError(USER_NOT_END_USER);
    }

    const users = await this.userRepo.getAllByIds(friendsIds, t);

    if (friendsIds.length !== users.length) {
      throw new ApiError(INVALID_FRIENDS_IDS);
    }

    await this.userRepo.updateFriends(id, friendsIds, t);
  }

  async register({ username, password, email }) {
    return this.create({ username, password, email });
  }

  async create({
    username, password, role = 'endUser', email
  }) {
    this.logger.log('info', 'create user');

    const hash = await PasswordService.hashPassword(password);

    await this.userRepo.create({
      username,
      email,
      password: hash,
      role
    });

    const entity = await this.userRepo.getOneByUsername(username);

    if (!entity) {
      throw new InternalError(DEFAULT_ERROR_MESSAGE);
    }

    return entity;
  }

  async loginWebUser(username, password) {
    this.logger.log('info', 'login web user');
    const user = await this.userRepo.getOneByUsername(username);

    if (!user) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    if (!user.isAdmin()) {
      throw new AuthError(USER_NOT_ADMIN);
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
      app: apps.web
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

    if (!user.isEndUser()) {
      throw new AuthError(USER_NOT_END_USER);
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
      app: apps.mobile
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

  async update(id, data, reqUser) {
    this.logger.log('info', 'update');
    const {
      username, password, email, friendsList
    } = data;

    await sequelize.transaction(async (t) => {
      const options = { transaction: t };

      if (email) {
        await this.updateEmailById(id, email, options);
      }
      if (username) {
        await this.updateUsernameById(id, username, options);
      }
      if (password) {
        await this.updatePasswordById(id, password, options);
      }
      if (friendsList) {
        if (reqUser.role !== roles.endUser) {
          throw new ForbiddenError(USER_NOT_END_USER);
        }
        await this.updateFriends(id, friendsList, options);
      }
    });

    const attributes = Object.keys(data).filter((attr) => attr !== 'friendsList');
    const result = await this.userRepo.getOneWithAttributes(id, attributes);

    if (friendsList) {
      result.friendsList = friendsList;
    }

    return result;
  }

  async updatePasswordById(id, password, options) {
    const hash = await PasswordService.hashPassword(password);

    await this.userRepo.update(id, { password: hash }, options);
  }

  async updateAvatarById(id, avatar, file) {
    const t = await sequelize.transaction();

    try {
      await this.userRepo.update(id, { avatar });
    }
    catch (err) {
      FileService.deleteFile(file);
      t.rollback();
    }

    return {
      avatar: FileService.getFilePath(file)
    };
  }

  async updateUsernameById(id, username, options) {
    const userData = await this.userRepo.getOne(id, options);

    if (!userData) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    await this.userRepo.update(id, { username }, options);
  }

  async updateEmailById(id, email, options) {
    await this.userRepo.update(id, { email }, options);
  }

  async destroy(id) {
    this.logger.log('info', 'delete user');
    const user = await this.userRepo.getOne(id);

    if (!user) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    await this.userRepo.destroy(id);
  }
}
