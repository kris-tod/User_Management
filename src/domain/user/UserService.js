import { sequelize } from '../../db/index.js';
import { UserRepository } from './UserRepository.js';
import {
  NotFoundError, ApiError, InternalError, ForbiddenError
} from '../../utils/errors.js';
import {
  USER_NOT_FOUND, INVALID_FRIENDS_IDS, INVALID_REGION, DEFAULT_ERROR_MESSAGE, LOGIN_FAILED
} from '../../constants/messages.js';
import FileService from '../../services/FileService.js';
import PasswordService from '../../services/passwordService.js';
import { apps } from '../../constants/apps.js';
import { roles } from './User.js';
import { createToken } from '../../utils/jwt.js';
import { TokenBlacklistRepository } from './tokenBlacklist/TokenBlacklistRepository.js';

export class UserService {
  constructor(logger) {
    this.logger = logger;
    this.userRepo = new UserRepository();
    this.tokenBlacklistRepo = new TokenBlacklistRepository();
  }

  async getAll(pageParam, reqUser) {
    this.logger.log('info', 'getall users');

    let page = pageParam || 1;
    if (page <= 0) {
      page = 1;
    }

    const collection = await this.userRepo.getAll(
      page,
      reqUser.role === roles.admin ? reqUser.region : ''
    );
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

  async create({
    username, password, email, region
  }, reqUser = {}) {
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

  async updateUserPassword(id, { password }, reqUser) {
    const user = await this.userRepo.getOne(id);

    if (!user) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    if (reqUser.role === roles.admin && reqUser.region !== user.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    const hash = await PasswordService.hashPassword(password);
    await this.userRepo.update(id, { password: hash });
  }

  async update(id, data) {
    this.logger.log('info', 'update');
    const {
      username, password, email, friendsList, region, favouritePartners
    } = data;

    await sequelize.transaction(async (t) => {
      const options = { transaction: t };
      if (region) {
        await this.updateRegionById(id, region, options);
      }
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
        await this.updateFriends(id, friendsList, options);
      }
      if (favouritePartners) {
        await this.userRepo.updateFavouritePartners(id, favouritePartners);
      }
    });

    const attributes = Object.keys(data);
    const user = await this.userRepo.getOne(id);
    const result = {};

    attributes.forEach((attr) => {
      result[attr] = user[attr];
    });

    return result;
  }

  async updateRegionById(id, region, options) {
    await this.userRepo.update(id, { region }, options);
  }

  async updatePasswordById(id, password, options) {
    const hash = await PasswordService.hashPassword(password);

    await this.userRepo.update(id, { password: hash }, options);
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

  async updateFriends(id, friendsIds, propObj) {
    this.logger.log('info', 'addfriend');

    const users = await this.userRepo.getAllByIds(friendsIds, propObj);

    if (friendsIds.length !== users.length) {
      throw new ApiError(INVALID_FRIENDS_IDS);
    }

    await this.userRepo.updateFriends(id, friendsIds, propObj);
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

  async destroy(id, reqUser) {
    this.logger.log('info', 'delete user');
    const entity = await this.userRepo.getOne(id);

    if (!entity) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    if (reqUser.role === roles.admin && entity.region !== reqUser.region) {
      throw new ApiError(INVALID_REGION);
    }

    await this.userRepo.destroy(id);
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

  async loginMobileUser(username, password) {
    this.logger.log('info', 'login mobile user');
    const user = await this.userRepo.getOneByUsername(username);

    if (!user) {
      throw new NotFoundError(LOGIN_FAILED);
    }

    const match = await PasswordService.comparePasswords(
      password,
      user.password
    );

    if (!match) {
      throw new ApiError(LOGIN_FAILED);
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
