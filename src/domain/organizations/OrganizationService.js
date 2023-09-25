import {
  INVALID_REGION,
  USER_NOT_SUPER_ADMIN,
  TOO_MANY_CARS,
  ADMIN_NOT_PARTNER_ADMIN,
  PARTNER_NOT_FOUND,
  SUBSCRIPTION_PLAN_NOT_FOUND,
  DEFAULT_ERROR_MESSAGE
} from '../../constants/messages.js';
import FileService from '../../services/FileService.js';
import {
  ApiError, ForbiddenError, InternalError, NotFoundError
} from '../../utils/errors.js';
import { AdminRepository } from '../admin/AdminRepository.js';
import { RegionRepository } from '../region/RegionRepository.js';
import { roles } from '../user/User.js';
import { OrganizationRepository } from './OrganizationRepository.js';
import { PartnerRepository } from '../partners/PartnerRepository.js';
import { CarSupportServiceRepository } from '../carSupportService/CarSupportServiceRepository.js';
import { SubscriptionPlanRepository } from '../subscriptionPlan/SubscriptionPlanRepository.js';
import { sequelize } from '../../db/index.js';
import { SubscriptionPlan } from '../subscriptionPlan/SubscriptionPlan.js';
import { CarSupportService } from '../carSupportService/CarSupportService.js';
import { Partner } from '../partners/Partner.js';
import { Organization } from './Organization.js';

export class OrganizationService {
  constructor(logger) {
    this.logger = logger;
    this.organizationRepo = new OrganizationRepository();
    this.partnerRepo = new PartnerRepository();
    this.subscriptionPlanRepo = new SubscriptionPlanRepository();
    this.servicesRepo = new CarSupportServiceRepository();
    this.adminsRepo = new AdminRepository();
    this.regionRepo = new RegionRepository();
  }

  async getAllOrganizations(page, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }

    return this.organizationRepo.getAll(page);
  }

  async getOneOrganization(id, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }
    const entity = await this.organizationRepo.getOne(id);

    if (!entity) {
      throw new NotFoundError('Organization not found');
    }

    return entity;
  }

  async organizationFactory({
    name, description
  }) {
    return new Organization(
      undefined,
      name,
      description
    );
  }

  async createOrganization(data, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }
    const organization = await this.organizationFactory(data);
    return this.organizationRepo.create(organization);
  }

  async updateOrganization(id, data, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }
    const organization = await this.organizationRepo.getOne(id);
    if (!organization) {
      throw new NotFoundError('Organization not found!');
    }

    await this.organizationRepo.update(id, data);
    const result = await this.organizationRepo.getOne(id);
    return Object.keys(data).reduce((obj, key) => {
      const propObj = obj;
      propObj[key] = result[key];
      return propObj;
    }, {});
  }

  async destroyOrganization(id, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }
    const organization = await this.organizationRepo.getOne(id);

    if (!organization) {
      throw new NotFoundError('Organization not found!');
    }

    return this.organizationRepo.destroy(id);
  }

  async getAllPartners(page, reqUser) {
    if (reqUser.role === roles.superadmin) {
      return this.partnerRepo.getAll(page);
    }
    if (reqUser.role === roles.admin) {
      return this.partnerRepo.getAll(page || 1, {
        where: {
          regionId: reqUser.region
        }
      });
    }
    return this.partnerRepo.getAllByAdmin(page || 1, reqUser.id);
  }

  async getOnePartner(id, reqUser) {
    const entity = await this.partnerRepo.getOne(id);

    if (reqUser.role === roles.partnerAdmin && !entity.admins
      .find((admin) => admin.id === reqUser.id)) {
      throw new ForbiddenError(ADMIN_NOT_PARTNER_ADMIN);
    }

    if (reqUser.role === roles.admin && reqUser.region !== entity.region.id) {
      throw new ForbiddenError(INVALID_REGION);
    }

    return entity;
  }

  async partnerFactory({
    name,
    description,
    address,
    coordinates,
    phone,
    contactPerson,
    regionId,
    subscriptionPlanId,
    admins,
    services,
    organizationId
  }) {
    const subscriptionPlan = await this.subscriptionPlanRepo.getOne(subscriptionPlanId);
    const partnerAdmins = await this.adminsRepo.getAllByIds(admins);
    const partnerServices = await this.servicesRepo.getAllByIds(services);
    const partnerRegion = await this.regionRepo.getOne(regionId);

    return new Partner(
      undefined,
      name,
      undefined,
      address,
      phone,
      contactPerson,
      partnerRegion,
      subscriptionPlan,
      organizationId,
      description,
      coordinates,
      partnerServices,
      partnerAdmins,
      []
    );
  }

  async createPartner(data, reqUser) {
    if (reqUser.role === roles.admin && reqUser.region !== data.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    if (!data.services || !data.admins || !data.subscriptionPlanId || !data.organizationId
      || !Array.isArray(data.services) || !Array.isArray(data.admins) || !data.admins.length) {
      throw new ApiError('Invalid data!');
    }

    const services = await this.servicesRepo.getAllByIds(data.services);

    if (services.some((service) => service.region.id !== data.regionId)) {
      throw new ApiError(INVALID_REGION);
    }

    const partnerAdmins = await this.adminsRepo.getAllByIds(data.admins);

    if (partnerAdmins.length !== data.admins.length) {
      throw new ApiError('Invalid partner admins!');
    }

    if (partnerAdmins.some((admin) => admin.region.id !== data.regionId)) {
      throw new ApiError('Invalid region!');
    }

    if (partnerAdmins.some((admin) => admin.role !== roles.partnerAdmin)) {
      throw new ApiError('Invalid partner admins!');
    }

    const subscriptionPlan = await this.subscriptionPlanRepo.getOne(data.subscriptionPlanId);

    if (!subscriptionPlan) {
      throw new ApiError('Invalid subscription!');
    }

    return sequelize.transaction(async (t) => {
      const options = {
        transaction: t
      };

      const partner = await this.partnerFactory(data);
      const result = await this.partnerRepo.create(partner, options);
      return result;
    });
  }

  async updatePartner(id, updatedData, reqUser) {
    const partner = await this.partnerRepo.getOne(id);
    if (!partner) {
      throw new NotFoundError(PARTNER_NOT_FOUND);
    }

    if (reqUser.role === roles.admin && !partner.admins
      .find((admin) => admin.id === reqUser.id)) {
      throw new ForbiddenError(ADMIN_NOT_PARTNER_ADMIN);
    }

    if (updatedData.cars) {
      if (!Array.isArray(updatedData.cars)) {
        throw new ApiError('Invalid cars!');
      }
      if (!partner.checkIfCarsMatchSubscriptionPlan(updatedData.cars)) {
        throw new ApiError(TOO_MANY_CARS);
      }
    }

    if (updatedData.services) {
      if (!Array.isArray(updatedData.services)) {
        throw new ApiError('Invalid services!');
      }

      const services = await this.servicesRepo.getAllByIds(updatedData.services);

      if (services.length !== updatedData.services.length) {
        throw new ApiError('Invalid services!');
      }

      if (services.some((service) => service.region.id !== partner.region.id)) {
        throw new ApiError(INVALID_REGION);
      }
    }

    if (updatedData.subscriptionPlanId) {
      const subscriptionPlan = await this.subscriptionPlanRepo
        .getOne(updatedData.subscriptionPlanId);

      if (!subscriptionPlan) {
        throw new ApiError('Invalid subscription!');
      }
    }

    if (updatedData.admins) {
      if (!Array.isArray(updatedData.admins)) {
        throw new ApiError('Invalid partner admins!');
      }

      const partnerAdmins = await this.adminsRepo.getAllByIds(updatedData.admins);

      if (partnerAdmins.length !== updatedData.admins.length) {
        throw new ApiError('Invalid partner admins!');
      }

      if (partnerAdmins.some((admin) => admin.region.id !== partner.region.id)) {
        throw new ApiError('Invalid region!');
      }

      if (partnerAdmins.some((admin) => admin.role !== roles.partnerAdmin)) {
        throw new ApiError('Invalid partner admins!');
      }
    }

    return sequelize.transaction(async (t) => {
      const options = {
        transaction: t
      };

      await this.partnerRepo.update(id, updatedData, options);
      const entity = await this.partnerRepo.getOne(id, options);

      return Object.keys(updatedData)
        .reduce((obj, key) => {
          const propObj = obj;
          propObj[key] = entity[key];
          return propObj;
        }, {});
    });
  }

  async destroyPartner(id, reqUser) {
    const partner = await this.partnerRepo.getOne(id);

    if (reqUser.role === roles.partnerAdmin && !partner.partnerAdmins
      .find((admin) => admin.id === reqUser.id)) {
      throw new ForbiddenError(ADMIN_NOT_PARTNER_ADMIN);
    }

    if (reqUser.role === roles.admin && reqUser.region !== partner.region.id) {
      throw new ForbiddenError(INVALID_REGION);
    }

    return this.partnerRepo.destroy(id);
  }

  async updatePartnerLogo(id, file, reqUser) {
    const partner = await this.partnerRepo.getOne(id);

    if (reqUser.role === roles.partnerAdmin && !partner.partnerAdmins
      .find((admin) => admin.id === reqUser.id)) {
      throw new ForbiddenError(ADMIN_NOT_PARTNER_ADMIN);
    }

    if (reqUser.role === roles.admin && reqUser.region !== partner.region.id) {
      throw new ForbiddenError(INVALID_REGION);
    }

    const t = await sequelize.transaction();
    const logo = FileService.getFilePath(file);

    try {
      const options = {
        transaction: t
      };

      await this.partnerRepo.update(id, { logo }, options);
      return { logo };
    }
    catch (err) {
      t.rollback();
      FileService.deleteFile(logo);
      throw new InternalError(DEFAULT_ERROR_MESSAGE);
    }
  }

  async getAllServices(page, reqUser) {
    const options = {};
    if (reqUser.role === roles.admin) {
      options.where = { regionId: reqUser.region };
    }
    return this.servicesRepo.getAll(page, options);
  }

  async getOneService(id) {
    const service = await this.servicesRepo.getOne(id);
    return service;
  }

  async serviceFactory({
    name, image, regionId, isRegionDefault, isPromoted, description
  }) {
    const serviceRegion = await this.regionRepo.getOne(regionId);

    return new CarSupportService(
      undefined,
      name,
      image,
      serviceRegion,
      isRegionDefault,
      isPromoted,
      description
    );
  }

  async createService(data, reqUser) {
    if (reqUser.role === roles.admin && reqUser.region !== data.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    const carService = await this.serviceFactory(data);
    return this.servicesRepo.create(carService);
  }

  async updateService(id, updatedData, reqUser) {
    const service = await this.servicesRepo.getOne(id);

    if (reqUser.role === roles.admin && reqUser.region !== service.region.id) {
      throw new ForbiddenError(INVALID_REGION);
    }

    await this.servicesRepo.update(id, updatedData);
    const result = await this.servicesRepo.getOne(id);
    return Object.keys(updatedData).reduce((obj, key) => {
      const propObj = obj;
      propObj[key] = result[key];
      return propObj;
    }, {});
  }

  async destroyService(id, reqUser) {
    const service = await this.servicesRepo.getOne(id);

    if (reqUser.role === roles.admin && reqUser.region !== service.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    return this.servicesRepo.destroy(id);
  }

  async getAllSubscriptionPlans(page) {
    return this.subscriptionPlanRepo.getAll(page);
  }

  async getOneSubscriptionPlan(id) {
    const subscriptionPlan = await this.subscriptionPlanRepo.getOne(id);
    return subscriptionPlan;
  }

  async subscriptionPlanFactory({
    name,
    price,
    commissionPerRequest,
    carsLimit,
    isDefault,
    description
  }) {
    return new SubscriptionPlan(
      undefined,
      name,
      price,
      commissionPerRequest,
      carsLimit,
      isDefault,
      description
    );
  }

  async createSubscriptionPlan(data, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }

    const subscriptionPlan = await this.subscriptionPlanFactory(data);
    return this.subscriptionPlanRepo.create(subscriptionPlan);
  }

  async updateSubscriptionPlan(id, data, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }

    const subscriptionPlan = await this.subscriptionPlanRepo.getOne(id);

    if (!subscriptionPlan) {
      throw new NotFoundError(SUBSCRIPTION_PLAN_NOT_FOUND);
    }

    await this.subscriptionPlanRepo.update(id, data);
    const result = await this.subscriptionPlanRepo.getOne(id);
    return Object.keys(data).reduce((obj, key) => {
      const propObj = obj;
      propObj[key] = result[key];
      return propObj;
    }, {});
  }

  async destroySubscriptionPlan(id, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }

    const subscriptionPlan = await this.subscriptionPlanRepo.getOne(id);

    if (!subscriptionPlan) {
      throw new NotFoundError(SUBSCRIPTION_PLAN_NOT_FOUND);
    }

    if (subscriptionPlan.isDefault) {
      throw new ApiError('Plan is default!');
    }

    const { data } = await this.partnerRepo.getAll(1, {
      where: { subscriptionPlanId: subscriptionPlan.id }
    });

    if (data.length) {
      throw new ApiError('Subscription plan is currently used!');
    }

    return this.subscriptionPlanRepo.destroy(id);
  }
}
