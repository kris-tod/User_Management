import { USER_NOT_SUPER_ADMIN } from '../../constants/messages.js';
import { ForbiddenError } from '../../utils/errors.js';
import { roles } from '../user/User.js';
import { RegionRepository } from './RegionRepository.js';

export class RegionService {
  constructor(logger) {
    this.logger = logger;
    this.regionRepo = new RegionRepository();
  }

  async getAll(page) {
    const result = await this.regionRepo.getAll(page);
    return result;
  }

  async create(data, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }

    return this.regionRepo.create(data);
  }

  async update(id, updatedData, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }

    await this.regionRepo.update(id, updatedData);
    return updatedData;
  }

  async getOne(id) {
    return this.regionRepo.getOne(id);
  }

  async destroy(id, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }

    await this.regionRepo.destroy(id);
  }
}
