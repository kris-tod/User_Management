import { roles } from '../user/User.js';
import { RequestRepository } from './RequestRepository.js';
import { PartnerRepository } from '../partners/PartnerRepository.js';
import { CarSupportServiceRepository } from '../carSupportService/CarSupportServiceRepository.js';
import { CarRepository } from '../car/CarRepository.js';
import { DriverRepository } from '../driver/DriverRepository.js';
import { Request } from './Request.js';
import { ApiError, ForbiddenError } from '../../utils/errors.js';
import {
  ADMIN_NOT_PARTNER_ADMIN, INVALID_REGION, USER_NOT_ADMIN, USER_NOT_END_USER
} from '../../constants/messages.js';

export class RequestService {
  constructor(logger) {
    this.logger = logger;
    this.requestRepo = new RequestRepository();
    this.partnerRepo = new PartnerRepository();
    this.serviceRepo = new CarSupportServiceRepository();
    this.driverRepo = new DriverRepository();
    this.carRepo = new CarRepository();
  }

  async requestFactory({
    address,
    carCoordinates,
    partner: partnerId,
    service: carSupportServiceId,
    car: carId,
    driver: driverId,
    driveAlone,
    status = 'pending',
    serialNumber = null,
    notes
  }) {
    console.log(partnerId);
    const partner = await this.partnerRepo.getOne(partnerId);
    const service = await this.serviceRepo.getOne(carSupportServiceId);
    const car = await this.carRepo.getOne(carId);
    const driver = await this.driverRepo.getOne(driverId);

    return new Request(
      this.requestRepo.generateId(),
      address,
      carCoordinates,
      partner,
      service,
      car,
      driver,
      driveAlone,
      status,
      serialNumber,
      notes
    );
  }

  async getAll(page, reqUser) {
    if (reqUser.role === roles.superadmin) {
      return this.requestRepo.getAll(page || 1);
    }
    if (reqUser.role === roles.admin) {
      return this.requestRepo.getAllByRegion(page || 1, reqUser.region);
    }
    return this.requestRepo.getAllByAdmin(page || 1, reqUser.id);
  }

  async getOne(id, reqUser) {
    const entity = await this.requestRepo.getOne(id);

    if (reqUser.role === roles.admin && entity.partner.region.id !== reqUser.id) {
      throw new ApiError(INVALID_REGION);
    }

    if (reqUser.role === roles.partnerAdmin) {
      const partner = await this.partnerRepo.getOne(entity.partner.id);

      if (!partner.admins.find((admin) => admin.id === reqUser.id)) {
        throw new ApiError(ADMIN_NOT_PARTNER_ADMIN);
      }
    }

    return entity;
  }

  async create(data, reqUser) {
    const partner = await this.partnerRepo.getOne(data.partner);
    if (reqUser.role === roles.admin && reqUser.region !== partner.region.id) {
      throw new ApiError(INVALID_REGION);
    }
    if (reqUser.role === roles.partnerAdmin
        && !partner.admins.find((admin) => admin.id === reqUser.id)) {
      throw new ApiError(ADMIN_NOT_PARTNER_ADMIN);
    }

    const driver = await this.driverRepo.getOne(data.driver);

    if (driver.partner.id !== partner.id) {
      throw new ApiError('Driver is not from the partner\'s drivers!');
    }

    if (!partner.services.find((partnerService) => partnerService.id === data.service)) {
      throw new ApiError('Service must be provided from the partner!');
    }

    const entity = await this.requestFactory(data);
    return this.requestRepo.create(entity);
  }

  async update(id, updatedData, reqUser) {
    const request = await this.requestRepo.getOne(id);
    if (reqUser.role !== roles.endUser) {
      if (updatedData.notes) {
        throw new ForbiddenError(USER_NOT_END_USER);
      }
    }
    else if (updatedData.driverId) {
      throw new ForbiddenError(USER_NOT_ADMIN);
    }

    if (reqUser.role === roles.admin) {
      if (request.partner.region.id !== reqUser.region) {
        throw new ApiError(INVALID_REGION);
      }
    }

    if (reqUser.role === roles.partnerAdmin) {
      const partner = await this.partnerRepo.getOne(request.partner.id);
      if (!partner.admins.find((admin) => admin.id === reqUser.id)) {
        throw new ApiError(ADMIN_NOT_PARTNER_ADMIN);
      }
    }

    await this.requestRepo.update(id, updatedData);
    const updatedRequest = await this.requestRepo.getOne(id);

    return Object.keys(updatedData)
      .reduce((obj, key) => {
        const propObj = obj;
        propObj[key] = updatedRequest[key];
        return propObj;
      }, {});
  }

  async destroy(id, reqUser) {
    const request = await this.requestRepo.getOne(id);
    if (reqUser.role === roles.admin && request.partner.region.id !== reqUser.region) {
      throw new ApiError(INVALID_REGION);
    }
    if (reqUser.role === roles.partnerAdmin) {
      const partner = await this.partnerRepo.getOne(request.partner.id);
      if (!partner.admins.find((admin) => admin.id === reqUser.id)) {
        throw new ApiError(ADMIN_NOT_PARTNER_ADMIN);
      }
    }

    await this.requestRepo.destroy(id);
  }
}
