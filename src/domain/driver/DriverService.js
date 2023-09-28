import { DriverRepository } from './DriverRepository.js';
import { roles } from '../user/User.js';
import {
  ApiError, AuthError, ForbiddenError, NotFoundError
} from '../../utils/errors.js';
import { INVALID_REGION, LOGIN_FAILED, PARTNER_NOT_FOUND } from '../../constants/messages.js';
import { PartnerRepository } from '../partners/PartnerRepository.js';
import PasswordService from '../../services/passwordService.js';
import { apps } from '../../constants/apps.js';
import { createToken } from '../../utils/jwt.js';
import { TokenBlacklistRepository } from '../user/tokenBlacklist/TokenBlacklistRepository.js';
import { RegionRepository } from '../region/RegionRepository.js';
import { Driver } from './Driver.js';
import { AdminRepository } from '../admin/AdminRepository.js';

export class DriverService {
  constructor(logger) {
    this.logger = logger;
    this.driverRepo = new DriverRepository();
    this.partnerRepo = new PartnerRepository();
    this.tokenBlacklistRepo = new TokenBlacklistRepository();
    this.regionRepo = new RegionRepository();
    this.adminRepo = new AdminRepository();
  }

  async getAll(page, reqUser) {
    if (reqUser.role === roles.admin) {
      const options = {};
      options.where = { regionId: reqUser.region };
      return this.driverRepo.getAll(
        page,
        ['name'],
        options
      );
    }
    if (reqUser.role === roles.organizationAdmin) {
      return this.driverRepo.getAllByOrganizationAdmin(page || 1, reqUser.id);
    }
    if (reqUser.role === roles.partnerAdmin) {
      return this.driverRepo.getAllByPartnerAdmin(page || 1, reqUser.id);
    }
    return this.driverRepo.getAll(page || 1);
  }

  async getOne(id, reqUser = {}) {
    const entity = await this.driverRepo.getOne(id);
    if (reqUser.role === roles.admin && entity.region.id !== reqUser.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    if (reqUser.role === roles.organizationAdmin) {
      const loggedUser = await this.adminRepo.getOne(reqUser.id);
      if (entity.partner.organizationId !== loggedUser.organization.id) {
        throw new ApiError('Admin not from organization!');
      }
    }

    return entity;
  }

  async driverFactory({
    name, password, description, number, pushNotificationsToken, signature, regionId, partnerId
  }) {
    const driverRegion = await this.regionRepo.getOne(regionId);
    const driverPartner = await this.partnerRepo.getOne(partnerId);
    return new Driver(
      undefined,
      name,
      password,
      undefined,
      number,
      driverRegion,
      driverPartner,
      pushNotificationsToken,
      signature,
      description
    );
  }

  async create(data, reqUser) {
    if (reqUser.role === roles.admin && data.region.id !== reqUser.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    const hash = await PasswordService.hashPassword(data.password);
    const driver = await this.driverFactory({
      ...data,
      password: hash
    });

    const entity = await this.driverRepo.create(driver);
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
      region: (entity.region ? entity.region.id : null),
      role: roles.driver
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

    if (updatedData.partnerId) {
      const partner = await this.partnerRepo.getOne(updatedData.partnerId);
      if (!partner) {
        throw new NotFoundError(PARTNER_NOT_FOUND);
      }
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

    return this.partnerRepo.getAllOfferingServiceByRegion(page || 1, serviceId, reqUser.region);
  }
}
