import PasswordService from '../services/passwordService.js';
import ServerError from '../../utils/ServerError.js';

import { createToken } from '../../utils/jwt.js';

import {
  INVALID_FRIENDS_IDS,
  PASSWORD_INCORRECT,
  USER_NOT_FOUND,
  DEFAULT_ERROR_MESSAGE
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

  async addFriends(id, friendsIds) {
    const users = await this.userRepo.getAllByIds(friendsIds);

    if (friendsIds.length !== users.length) {
      throw new ServerError(404, INVALID_FRIENDS_IDS);
    }

    await this.userRepo.updateFriends(id, friendsIds);
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
    const { username, password, email } = data;

    if (email) {
      await this.updateEmailById(id, email);
    }
    if (username) {
      await this.updateUsernameById(id, username);
    }
    if (password) {
      await this.updatePasswordById(id, password);
    }
    this.logger.log('info', 'update');
    return this.userRepo.getOneWithAttributes(id, Object.keys(data));
  }

  async updatePasswordById(id, password) {
    const hash = await PasswordService.hashPassword(password);

    await this.userRepo.update(id, { password: hash });
  }

  async updateAvatarById(id, avatar) {
    return this.userRepo.update(id, { avatar });
  }

  async updateUsernameById(id, username) {
    const userData = await this.userRepo.getOne(id);

    if (!userData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    await this.userRepo.update(id, { username });
  }

  async updateEmailById(id, email) {
    await this.userRepo.update(id, { email });
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
