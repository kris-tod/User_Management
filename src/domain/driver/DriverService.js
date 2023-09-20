import { DriverRepository } from './DriverRepository.js';
import { roles } from '../user/User.js';
import { AuthError, ForbiddenError } from '../../utils/errors.js';
import { INVALID_REGION, LOGIN_FAILED } from '../../constants/messages.js';
import { PartnerRepository } from '../partners/PartnerRepository.js';
import PasswordService from '../../services/passwordService.js';
import { apps } from '../../constants/apps.js';
import { createToken } from '../../utils/jwt.js';
import { TokenBlacklistRepository } from '../user/tokenBlacklist/TokenBlacklistRepository.js';

export class DriverService {
  constructor(logger) {
    this.logger = logger;
    this.driverRepo = new DriverRepository();
    this.partnerRepo = new PartnerRepository();
    this.tokenBlacklistRepo = new TokenBlacklistRepository();
  }

  async getAll(page, reqUser) {
    const options = {};
    if (reqUser.role === roles.admin) {
      options.where = { regionId: reqUser.region };
    }
    return this.driverRepo.getAll(
      page,
      ['name'],
      options
    );
  }

  async getOne(id, reqUser = {}) {
    const entity = await this.driverRepo.getOne(id);
    if (reqUser.role === roles.admin && entity.region.id !== reqUser.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    return entity;
  }

  async create(data, reqUser) {
    if (reqUser.role === roles.admin && data.region.id !== reqUser.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    const hash = await PasswordService.hashPassword(data.password);

    const entity = await this.driverRepo.create({
      ...data,
      password: hash
    });

    return entity;
  }

  async loginDriverUser(name, password) {
    const entity = await this.driverRepo.getByName(name);
    const match = await PasswordService.comparePasswords(password, entity.password);

    if (!match) {
      throw new AuthError(LOGIN_FAILED);
    }

    const token = createToken({
      id: entity.id,
      app: apps.driver,
      region: (entity.region ? entity.region.id : null)
    });

    return {
      entity,
      token
    };
  }

  async logout(token) {
    await this.tokenBlacklistRepo.create({ token });
  }

  async update(id, updatedData, reqUser) {
    const driver = await this.driverRepo.getOne(id);

    if (reqUser.role === roles.admin && driver.region.id !== reqUser.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    await this.driverRepo.update(id, updatedData);
    const entity = await this.driverRepo.getOne(id);

    return Object.keys(updatedData)
      .reduce((obj, key) => {
        const propObj = obj;
        propObj[key] = entity[key];
        return propObj;
      }, {});
  }

  async destroy(id, reqUser) {
    const entity = await this.driverRepo.getOne(id);

    if (reqUser.role === roles.admin && entity.region.id !== reqUser.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    await this.driverRepo.destroy(entity.id);
  }

  async getAllPartners(page = 1, reqUser = {}, serviceId = null) {
    if (!serviceId) {
      const partners = await this.partnerRepo.getAll(page, {
        where: {
          regionId: reqUser.region
        }
      });

      return partners;
    }

    return this.partnerRepo.getAllOfferingService(page || 1, serviceId, {
      where: {
        regionId: reqUser.region
      }
    });
  }
}
