import {
  INVALID_REGION,
  USER_NOT_SUPER_ADMIN,
  TOO_MANY_CARS,
  ADMIN_NOT_PARTNER_ADMIN
} from '../../constants/messages.js';
import FileService from '../../services/FileService.js';
import { ApiError, ForbiddenError } from '../../utils/errors.js';
import { roles } from '../user/User.js';
import { OrganizationRepository } from './OrganizationRepository.js';
import { PartnerRepository } from './partners/PartnerRepository.js';
import { CarSupportServiceRepository } from './partners/carSupportService/CarSupportServiceRepository.js';
import { SubscriptionPlanRepository } from './partners/subscriptionPlan/SubscriptionPlanRepository.js';

export class OrganizationService {
  constructor(logger) {
    this.logger = logger;
    this.organizationRepo = new OrganizationRepository();
    this.partnerRepo = new PartnerRepository();
    this.subscriptionPlanRepo = new SubscriptionPlanRepository();
    this.servicesRepo = new CarSupportServiceRepository();
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

    return entity;
  }

  async createOrganization(data, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }
    return this.organizationRepo.create(data);
  }

  async updateOrganization(id, data, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
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
    return this.organizationRepo.destroy(id);
  }

  async getAllPartners(page, reqUser) {
    return this.partnerRepo.getAll(
      page,
      reqUser.role === roles.admin ? reqUser.region : ''
    );
  }

  async getOnePartner(id, reqUser) {
    const entity = await this.partnerRepo.getOne(id);

    if (reqUser.role === roles.admin && reqUser.region !== entity.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    return entity;
  }

  async createPartner(data, reqUser) {
    if (reqUser.role === roles.admin && reqUser.region !== data.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    const services = await this.servicesRepo.getAllByIds(data.carSupportServices);

    services.forEach((service) => {
      if (service.region !== data.region) {
        throw new ApiError(INVALID_REGION);
      }
    });

    return this.partnerRepo.create(data);
  }

  async updatePartner(id, updatedData, reqUser) {
    const partner = await this.partnerRepo.getOne(id);

    if (reqUser.role === roles.admin && reqUser.region !== partner.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    if (reqUser.role === roles.admin && !partner.partnerAdmins
      .find((admin) => admin.id === reqUser.id)) {
      throw new ForbiddenError(ADMIN_NOT_PARTNER_ADMIN);
    }

    const subscriptionPlan = await this.subscriptionPlanRepo.getOne(partner.subscriptionPlan.id);

    if (updatedData.cars && subscriptionPlan.carsCount < updatedData.cars.length) {
      throw new ApiError(TOO_MANY_CARS);
    }

    if (updatedData.carSupportServices) {
      const services = await this.servicesRepo.getAllByIds(updatedData.carSupportServices);

      services.forEach((service) => {
        if (service.region !== partner.region) {
          throw new ApiError(INVALID_REGION);
        }
      });
    }

    await this.partnerRepo.update(id, updatedData);
    const entity = await this.partnerRepo.getOne(id);

    return Object.keys(updatedData)
      .reduce((obj, key) => {
        const propObj = obj;
        propObj[key] = entity[key];
        return propObj;
      }, {});
  }

  async destroyPartner(id, reqUser) {
    const partner = await this.partnerRepo.getOne(id);

    if (reqUser.role === roles.admin && reqUser.region !== partner.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    return this.partnerRepo.destroy(id); // TODO: update schema for deleting
  }

  async updatePartnerLogo(id, file, reqUser) {
    const partner = await this.partnerRepo.getOne(id);

    if (reqUser.role === roles.admin && reqUser.region !== partner.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    const logo = FileService.getFilePath(file);
    await this.partnerRepo.update(id, { logo });

    return { logo };
  }

  async getAllServices(page, reqUser) {
    const options = {};
    if (reqUser.role === roles.admin) {
      options.where = { region: reqUser.region };
    }
    return this.servicesRepo.getAll(page, ['name'], options);
  }

  async getOneService(id) {
    return this.servicesRepo.getOne(id);
  }

  async createService(data, reqUser) {
    if (reqUser.role === roles.admin && reqUser.region !== data.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    return this.servicesRepo.create(data);
  }

  async updateService(id, updatedData, reqUser) {
    const service = await this.servicesRepo.getOne(id);

    if (reqUser.role === roles.admin && reqUser.region !== service.region) {
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

  async getAllSubscriptions(page) {
    return this.subscriptionPlanRepo.getAll(page);
  }

  async getOneSubscription(id) {
    return this.subscriptionPlanRepo.getOne(id);
  }

  async createSubscription(data, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }

    return this.subscriptionPlanRepo.create(data);
  }

  async updateSubscription(id, data, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }

    await this.subscriptionPlanRepo.update(id, data);
    const result = await this.subscriptionPlanRepo.getOne(id);
    return Object.keys(data).reduce((obj, key) => {
      const propObj = obj;
      propObj[key] = result[key];
      return propObj;
    }, {});
  }

  async destroySubscription(id, reqUser) {
    if (reqUser.role !== roles.superadmin) {
      throw new ForbiddenError(USER_NOT_SUPER_ADMIN);
    }

    return this.subscriptionPlanRepo.destroy(id);
  }
}
