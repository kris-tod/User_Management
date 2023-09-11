import PasswordService from '../services/passwordService.js';
import ServerError from '../../utils/ServerError.js';
import { sequelize } from '../../models/db.js';

import { createToken } from '../../utils/jwt.js';

import {
  INVALID_FRIENDS_IDS,
  PASSWORD_INCORRECT,
  USER_NOT_FOUND,
  DEFAULT_ERROR_MESSAGE,
  USER_NOT_END_USER
} from '../../constants/messages.js';

import { UserRepository } from './UserRepository.js';
import { TokenBlacklistRepository } from './tokenBlacklist/TokenBlacklistRepository.js';

export class UserService {
  constructor(logger) {
    this.userRepo = new UserRepository();
    this.tokenBlacklistRepo = new TokenBlacklistRepository();
    this.logger = logger;
  }

  async getAll(pageParam) {
    let page = pageParam || 1;
    if (page <= 0) {
      page = 1;
    }

    const collection = await this.userRepo.getAll(page);

    this.logger.log('info', 'getall users');
    return collection;
  }

  async getOne(id) {
    const user = await this.userRepo.getOne(id);

    if (!user) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    this.logger.log('info', 'getone user');
    return user;
  }

  async updateFriends(id, friendsIds, t) {
    const user = await this.userRepo.getOne(id);

    if (!user.isEndUser()) {
      throw new ServerError(401, USER_NOT_END_USER);
    }

    const users = await this.userRepo.getAllByIds(friendsIds, t);

    if (friendsIds.length !== users.length) {
      throw new ServerError(404, INVALID_FRIENDS_IDS);
    }

    await this.userRepo.updateFriends(id, friendsIds, t);
    this.logger.log('info', 'addfriend');
  }

  async create({
    username, password, role, email
  }) {
    const hash = await PasswordService.hashPassword(password);

    await this.userRepo.create({
      username,
      email,
      password: hash,
      role
    });

    const entity = await this.userRepo.getOneByUsername(username);

    if (!entity) {
      throw new ServerError(500, DEFAULT_ERROR_MESSAGE);
    }

    this.logger.log('info', 'create user');
    return entity;
  }

  async loginUser(username, password) {
    const user = await this.userRepo.getOneByUsername(username);

    if (!user) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    const match = await PasswordService.comparePasswords(
      password,
      user.password
    );

    if (!match) {
      throw new ServerError(400, PASSWORD_INCORRECT);
    }

    const token = createToken({
      id: user.id,
      role: user.role
    });

    this.logger.log('info', 'login user');
    return {
      user,
      token
    };
  }

  async logout(token) {
    this.logger.log('info', 'logout');
    await this.tokenBlacklistRepo.create({ token });
  }

  async update(id, data) {
    const {
      username, password, email, friendsList
    } = data;

    await sequelize.transaction(async (t) => {
      const propObj = { transaction: t };

      if (email) {
        await this.updateEmailById(id, email, propObj);
      }
      if (username) {
        await this.updateUsernameById(id, username, propObj);
      }
      if (password) {
        await this.updatePasswordById(id, password, propObj);
      }
      if (friendsList) {
        await this.updateFriends(id, friendsList, propObj);
      }
    });

    const attributes = Object.keys(data).filter((attr) => attr !== 'friendsList');
    const result = await this.userRepo.getOneWithAttributes(id, attributes);

    if (friendsList) {
      result.friendsList = friendsList;
    }

    this.logger.log('info', 'update');
    return result;
  }

  async updatePasswordById(id, password, propObj) {
    const hash = await PasswordService.hashPassword(password);

    await this.userRepo.update(id, { password: hash }, propObj);
  }

  async updateAvatarById(id, avatar) {
    return this.userRepo.update(id, { avatar });
  }

  async updateUsernameById(id, username, propObj) {
    const userData = await this.userRepo.getOne(id);

    if (!userData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    await this.userRepo.update(id, { username }, propObj);
  }

  async updateEmailById(id, email, propObj) {
    await this.userRepo.update(id, { email }, propObj);
  }

  async destroy(id) {
    const user = await this.userRepo.getOne(id);

    if (!user) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    await this.userRepo.destroy(id);
    this.logger.log('info', 'delete user');
  }
}
