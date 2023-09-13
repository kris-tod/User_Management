import { UserRepository } from './UserRepository.js';
import PasswordService from '../services/passwordService.js';
import {
  ApiError, ForbiddenError, InternalError, NotFoundError
} from '../../utils/errors.js';
import {
  DEFAULT_ERROR_MESSAGE,
  INVALID_REGION,
  USER_NOT_FOUND
} from '../../constants/messages.js';
import { roles } from './User.js';

export class AdminUserService {
  constructor(logger) {
    this.logger = logger;
    this.userRepo = new UserRepository();
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

  async update(id, { password }, reqUser) {
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
}
