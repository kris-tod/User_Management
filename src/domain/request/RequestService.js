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
import { UserRepository } from '../user/UserRepository.js';

export class RequestService {
  constructor(logger) {
    this.logger = logger;
    this.requestRepo = new RequestRepository();
    this.partnerRepo = new PartnerRepository();
    this.serviceRepo = new CarSupportServiceRepository();
    this.driverRepo = new DriverRepository();
    this.carRepo = new CarRepository();
    this.userRepo = new UserRepository();
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
    const partner = await this.partnerRepo.getOne(partnerId);
    const service = await this.serviceRepo.getOne(carSupportServiceId);
    const car = await this.carRepo.getOne(carId);
    const driver = (driverId ? await this.driverRepo.getOne(driverId) : null);

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
    if (reqUser.role === roles.partnerAdmin) {
      return this.requestRepo.getAllByAdmin(page || 1, reqUser.id);
    }
    if (reqUser.role === roles.endUser) {
      return this.requestRepo.getAllByUser(page || 1, reqUser.id);
    }
    return this.requestRepo.getAllByDriver(page || 1, reqUser.id);
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

    if (reqUser.role === roles.endUser) {
      const user = await this.userRepo.getOne(reqUser.id);
      if (!user.cars.find((car) => car.id === entity.car.id)) {
        throw new ApiError('Request does not belong to user!');
      }
    }

    if (reqUser.role === roles.driver) {
      if (entity.driver.id !== reqUser.id) {
        throw new ApiError('Request does not belong to driver!');
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

    if (reqUser.role === roles.endUser) {
      if (data.driver) {
        throw new ApiError('User cannot set request driver!');
      }
      const user = await this.userRepo.getOne(reqUser.id);
      if (!user.cars.find((car) => car.id === data.car)) {
        throw new ApiError('Car does not belong to user!');
      }
    }

    if (reqUser.role !== roles.endUser) {
      const driver = await this.driverRepo.getOne(data.driver);

      if (driver.partner.id !== partner.id) {
        throw new ApiError('Driver is not from the partner\'s drivers!');
      }
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
    else if (updatedData.driver) {
      throw new ForbiddenError(USER_NOT_ADMIN);
    }

    if (reqUser.role === roles.admin) {
      if (request.partner.region.id !== reqUser.region) {
        throw new ApiError(INVALID_REGION);
      }
    }

    if (reqUser.role === roles.endUser) {
      if (updatedData.status) {
        throw new ApiError('Users cannot update status!');
      }
      const user = await this.userRepo.getOne(reqUser.id);
      if (!user.cars.find((car) => car.id === request.car.id)) {
        throw new ApiError('Request does not belong to user!');
      }
    }

    if (reqUser.role === roles.partnerAdmin) {
      const partner = await this.partnerRepo.getOne(request.partner.id);
      if (!partner.admins.find((admin) => admin.id === reqUser.id)) {
        throw new ApiError(ADMIN_NOT_PARTNER_ADMIN);
      }
    }

    if (reqUser.role === roles.driver) {
      if (!updatedData.status || Object.keys(updatedData).length > 1) {
        throw new ApiError('Drivers only can update request status!');
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

    if (reqUser.role === roles.endUser) {
      const user = await this.userRepo.getOne(reqUser.id);
      if (!user.cars.find((car) => car.id === request.car.id)) {
        throw new ApiError('Request does not belong to user!');
      }
    }

    await this.requestRepo.destroy(id);
  }
}
