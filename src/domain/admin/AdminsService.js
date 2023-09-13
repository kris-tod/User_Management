import { AdminRepository } from './AdminRepository.js';
import PasswordService from '../services/passwordService.js';
import {
  ApiError, InternalError, NotFoundError
} from '../../utils/errors.js';
import {
  DEFAULT_ERROR_MESSAGE,
  INVALID_REGION,
  USER_NOT_FOUND
} from '../../constants/messages.js';
import { roles } from '../user/User.js';

export class AdminsService {
  constructor(logger) {
    this.logger = logger;
    this.adminRepo = new AdminRepository();
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

  async create({
    username, password, email, region
  }, reqUser = {}) {
    this.logger.log('info', 'create user');

    if (reqUser.role !== roles.superadmin) {
      throw new ApiError(INVALID_REGION);
    }

    const hash = await PasswordService.hashPassword(password);
    await this.adminRepo.create({
      username,
      email,
      password: hash,
      region,
      role: roles.admin
    });

    const entity = await this.adminRepo.getOneByUsername(username);

    if (!entity) {
      throw new InternalError(DEFAULT_ERROR_MESSAGE);
    }

    return entity;
  }

  async update(id, { password }, reqUser) {
    const user = await this.adminRepo.getOne(id);

    if (!user) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    if (reqUser.role !== roles.superadmin) {
      throw new ApiError(INVALID_REGION);
    }

    const hash = await PasswordService.hashPassword(password);
    await this.adminRepo.update(id, { password: hash });
  }

  async destroy(id, reqUser) {
    this.logger.log('info', 'delete user');
    const entity = await this.adminRepo.getOne(id);

    if (!entity) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    if (reqUser.role !== roles.superadmin) {
      throw new ApiError(INVALID_REGION);
    }

    await this.adminRepo.destroy(id);
  }
}
