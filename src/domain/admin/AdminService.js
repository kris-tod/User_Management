import { sequelize } from '../../db/index.js';
import { AdminRepository } from './AdminRepository.js';
import { NotFoundError, InternalError, ApiError } from '../../utils/errors.js';
import { apps } from '../../constants/apps.js';
import { createToken } from '../../utils/jwt.js';
import {
  USER_NOT_FOUND,
  ADMIN_NOT_SUPERADMIN,
  DEFAULT_ERROR_MESSAGE,
  LOGIN_FAILED
} from '../../constants/messages.js';
import PasswordService from '../../services/passwordService.js';
import { roles } from '../user/User.js';
import { TokenBlacklistRepository } from '../user/tokenBlacklist/TokenBlacklistRepository.js';
import { RegionRepository } from '../region/RegionRepository.js';
import { Admin } from './Admin.js';

export class AdminService {
  constructor(logger) {
    this.logger = logger;
    this.adminRepo = new AdminRepository();
    this.tokenBlacklistRepo = new TokenBlacklistRepository();
    this.regionRepo = new RegionRepository();
  }

  async getAll(pageParam) {
    this.logger.log('info', 'getall users');

    let page = pageParam || 1;
    if (page <= 0) {
      page = 1;
    }

    const collection = await this.adminRepo.getAll(page);
    return collection;
  }

  async getOne(id) {
    this.logger.log('info', 'getone user');

    const user = await this.adminRepo.getOne(id);

    if (!user) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    return user;
  }

  async adminFactory({
    username, password, email, regionId
  }) {
    const region = await this.regionRepo.getOne(regionId);
    return new Admin(
      undefined,
      username,
      password,
      roles.admin,
      region,
      email
    );
  }

  async create({
    username, password, email, regionId
  }, reqUser = {}) {
    this.logger.log('info', 'create user');

    if (reqUser.role !== roles.superadmin) {
      throw new ApiError(ADMIN_NOT_SUPERADMIN);
    }

    const hash = await PasswordService.hashPassword(password);

    const admin = await this.adminFactory({
      username, password: hash, email, regionId
    });

    await this.adminRepo.create(admin);

    const entity = await this.adminRepo.getOneByUsername(username);

    if (!entity) {
      throw new InternalError(DEFAULT_ERROR_MESSAGE);
    }

    return entity;
  }

  async update(id, data) {
    this.logger.log('info', 'update');
    const {
      username, password, email
    } = data;

    await sequelize.transaction(async (t) => {
      const options = { transaction: t };
      if (email) {
        await this.adminRepo.update(id, { email }, options);
      }
      if (username) {
        await this.adminRepo.update(id, { username }, options);
      }
      if (password) {
        await this.updatePasswordById(id, password, options);
      }
    });

    const attributes = Object.keys(data);
    const admin = await this.adminRepo.getOne(id);

    const result = {};

    attributes.forEach((attr) => {
      result[attr] = admin[attr];
    });

    return result;
  }

  async updateAdminPassword(id, { password }, reqUser) {
    const user = await this.adminRepo.getOne(id);

    if (!user) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    if (reqUser.role !== roles.superadmin) {
      throw new ApiError(ADMIN_NOT_SUPERADMIN);
    }

    const hash = await PasswordService.hashPassword(password);
    await this.adminRepo.update(id, { password: hash });
  }

  async updatePasswordById(id, password, options) {
    const hash = await PasswordService.hashPassword(password);
    await this.adminRepo.update(id, { password: hash }, options);
  }

  async destroy(id, reqUser) {
    this.logger.log('info', 'delete user');
    const entity = await this.adminRepo.getOne(id);

    if (!entity) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    if (reqUser.role !== roles.superadmin) {
      throw new ApiError(ADMIN_NOT_SUPERADMIN);
    }

    await this.adminRepo.destroy(id);
  }

  async loginWebUser(username, password) {
    this.logger.log('info', 'login web user');
    const user = await this.adminRepo.getOneByUsername(username);

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
      role: user.role,
      app: apps.web,
      region: user.region ? user.region.id : null
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
