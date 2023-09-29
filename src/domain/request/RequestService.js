import { roles } from '../user/User.js';
import { RequestRepository } from './RequestRepository.js';
import { PartnerRepository } from '../partners/PartnerRepository.js';
import { CarSupportServiceRepository } from '../carSupportService/CarSupportServiceRepository.js';
import { CarRepository } from '../car/CarRepository.js';
import { DriverRepository } from '../driver/DriverRepository.js';
import { Request } from './Request.js';
import { ApiError, ForbiddenError, NotFoundError } from '../../utils/errors.js';
import {
  ADMIN_NOT_PARTNER_ADMIN, INVALID_REGION, USER_NOT_ADMIN, USER_NOT_END_USER
} from '../../constants/messages.js';
import { UserRepository } from '../user/UserRepository.js';
import { AdminRepository } from '../admin/AdminRepository.js';
import { OfferRepository } from './offer/OfferRepository.js';
import { OfferItemRepository } from './offer/offerItem/OfferItemRepository.js';
import { Offer } from './offer/Offer.js';
import { OfferItem } from './offer/offerItem/OfferItem.js';
import { WorkCard } from './workCard/WorkCard.js';
import { WorkCardRepository } from './workCard/WorkCardRepository.js';
import { WorkCardItemRepository } from './workCard/workCardItem/WorkCardItemRepository.js';
import { WorkCardItem } from './workCard/workCardItem/WorkCardItem.js';
import { sequelize } from '../../db/index.js';
import { ProtocolRepository } from './protocol/ProtocolRepository.js';
import { Protocol, protocolTypes } from './protocol/Protocol.js';
import { PdfService } from '../../services/PdfService.js';

export class RequestService {
  constructor(logger) {
    this.logger = logger;
    this.requestRepo = new RequestRepository();
    this.partnerRepo = new PartnerRepository();
    this.serviceRepo = new CarSupportServiceRepository();
    this.driverRepo = new DriverRepository();
    this.carRepo = new CarRepository();
    this.userRepo = new UserRepository();
    this.adminRepo = new AdminRepository();
    this.offerRepo = new OfferRepository();
    this.offerItemRepo = new OfferItemRepository();
    this.workCardRepo = new WorkCardRepository();
    this.workCardItemRepo = new WorkCardItemRepository();
    this.protocolRepo = new ProtocolRepository();
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
    if (reqUser.role === roles.organizationAdmin) {
      return this.requestRepo.getAllByOrganizationAdmin(page || 1, reqUser.id);
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

    if (reqUser.role === roles.organizationAdmin) {
      const loggedUser = await this.adminRepo.getOne(reqUser.id);
      if (loggedUser.organization.id !== entity.partner.organizationId) {
        throw new ApiError('Request does not belong to organization!');
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

    if (updatedData.status && updatedData.status === 'done') {
      throw new ApiError('Status \'done\' cannot be set that way!');
    }
    return sequelize.transaction(async (t) => {
      const options = {
        transaction: t
      };

      await this.requestRepo.update(id, updatedData, options);
      const updatedRequest = await this.requestRepo.getOne(id, options);

      return Object.keys(updatedData)
        .reduce((obj, key) => {
          const propObj = obj;
          propObj[key] = updatedRequest[key];
          return propObj;
        }, {});
    });
  }

  async createProtocol(requestId, {
    fuelAvailable,
    clientNumber,
    clientSignature,
    type,
    checks
  }, reqUser) {
    if (!Object.keys(protocolTypes).includes(type)) {
      throw new ApiError('Invalid protocol type!');
    }

    const request = await this.requestRepo.getOne(requestId);

    if (!request) {
      throw new NotFoundError('Request not found!');
    }

    if (type === protocolTypes.preliminary && request.status !== 'accepted') {
      throw new ApiError('Request status is not accepted!');
    }
    if (type === protocolTypes.transmissive && request.status !== 'done') {
      throw new ApiError('Request status is not done!');
    }

    const driver = await this.driverRepo.getOne(reqUser.id);
    const client = await this.userRepo.getOneByCar(request.car.id);
    if (!client) {
      throw new NotFoundError('Client not found!');
    }
    const car = await this.carRepo.getOne(request.car.id);
    const protocol = new Protocol(
      this.protocolRepo.generateId(),
      fuelAvailable,
      car.kilometers,
      client.username,
      clientNumber,
      clientSignature,
      driver.signature,
      checks
    );
    if (type === protocolTypes.preliminary) {
      return this.requestRepo.addOrReplacePreliminaryProtocol(requestId, protocol);
    }
    return this.requestRepo.addOrReplaceTransmissiveProtocol(requestId, protocol);
  }

  async generateProtocolPdf(protocolId, reqUser) {
    const protocol = await this.protocolRepo.getOne(protocolId);
    protocol.checks = JSON.stringify(protocol.checks);
    const driver = this.driverRepo.getOne(reqUser.id);
    const request = await this.requestRepo.getOne(protocol.requestId);

    return PdfService.generatePdfForProtocol({
      protocolId,
      driver,
      car: request.car,
      ...protocol
    });
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

  workCardFactory({
    items
  }) {
    const workCardId = this.workCardRepo.generateId();
    return new WorkCard(
      workCardId,
      items.map((item) => (new WorkCardItem(
        this.workCardItemRepo.generateId(),
        item.name,
        item.value,
        workCardId
      )))
    );
  }

  async finishRequest(id, data, reqUser) {
    if (reqUser.role !== roles.driver) {
      throw new ForbiddenError('Only drivers can finish requests!');
    }

    const request = await this.requestRepo.getOne(id);
    if (reqUser.id !== request.driver.id) {
      throw new ForbiddenError('Request does not belong to driver!');
    }

    const items = request.offers
      .map((offer) => offer.toJSON())
      .filter((offer) => offer.isAccepted)
      .reduce((acc, curr) => (acc.concat(curr.offer_items)), []);

    const workCard = this.workCardFactory({ items: items.concat(data.items || []) });

    await this.requestRepo.update(id, { status: 'done' });
    return this.workCardRepo.create(workCard);
  }

  async getAllWorkCards(page, reqUser) {
    if (reqUser.role === roles.endUser) {
      throw new ForbiddenError('Cannot list work card info!');
    }
    return this.workCardRepo.getAll(page || 1);
  }

  async getAllOffers(page, reqUser) {
    if (reqUser.role === roles.superadmin) {
      return this.offerRepo.getAll(page || 1);
    }
    if (reqUser.role === roles.admin) {
      return this.offerRepo.getAllByRegion(page || 1, reqUser.region);
    }
    if (reqUser.role === roles.partnerAdmin) {
      return this.offerRepo.getAllByRegion(page || 1, reqUser.region);
    }
    if (reqUser.role === roles.driver) {
      return this.offerRepo.getAllByDriver(page || 1, reqUser.id);
    }
    if (reqUser.role === roles.organizationAdmin) {
      const loggedAdmin = await this.adminRepo.getOne(reqUser.id);
      return this.offerRepo.getAllByOrganizationAdmin(page || 1, loggedAdmin.organization.id);
    }

    throw new ForbiddenError('End users cannot see all offers!');
  }

  async getOneOffer(id, reqUser) {
    const entity = await this.offerRepo.getOne(id);

    if (!entity) {
      throw new NotFoundError('Offer not found!');
    }

    const request = await this.requestRepo.getOne(entity.requestId);

    if (reqUser.role === roles.admin && request.region.id !== reqUser.region) {
      throw new ForbiddenError(INVALID_REGION);
    }

    if (reqUser.role === roles.partnerAdmin && !request.partner.admins.find(
      (admin) => admin.id === reqUser.id
    )) {
      throw new ApiError(ADMIN_NOT_PARTNER_ADMIN);
    }

    if (reqUser.role === roles.driver && request.driver.id !== reqUser.id) {
      throw new ApiError('Driver not from offer\'s request');
    }

    return entity;
  }

  async offerFactory({
    title,
    isAccepted,
    requestId
  }) {
    const request = await this.requestRepo.getOne(requestId);
    return new Offer(this.offerRepo.generateId(), title, request.id, isAccepted);
  }

  async createOffer(data, reqUser) {
    const request = await this.requestRepo.getOne(data.requestId);
    if (reqUser.role === roles.admin && request.partner.region.id !== reqUser.region) {
      throw new ForbiddenError(INVALID_REGION);
    }
    if (reqUser.role === roles.partnerAdmin && !request.partner.admins.find(
      (admin) => admin.id !== reqUser.id
    )) {
      throw new ForbiddenError(ADMIN_NOT_PARTNER_ADMIN);
    }
    if (reqUser.role === roles.driver && request.driver.id !== reqUser.id) {
      throw new ForbiddenError('Driver not from offer\'s request');
    }
    const offer = await this.offerFactory(data);
    return this.offerRepo.create(offer);
  }

  itemFactory({
    name, value, offerId
  }) {
    return new OfferItem(this.offerItemRepo.generateId(), name, value, offerId);
  }

  async updateOffer(id, updatedData, reqUser) {
    const offer = await this.offerRepo.getOne(id);

    if (!offer) {
      throw new NotFoundError('Offer not found!');
    }

    const request = await this.requestRepo.getOne(offer.requestId);
    if (reqUser.role === roles.admin && request.partner.region.id !== reqUser.region) {
      throw new ForbiddenError(INVALID_REGION);
    }
    if (reqUser.role === roles.partnerAdmin && !request.partner.admins.find(
      (admin) => admin.id !== reqUser.id
    )) {
      throw new ForbiddenError(ADMIN_NOT_PARTNER_ADMIN);
    }
    if (reqUser.role === roles.driver && request.driver.id !== reqUser.id) {
      throw new ForbiddenError('Driver not from offer\'s request');
    }

    if (reqUser.role === roles.endUser
      && updatedData.isAccepted !== undefined
      && updatedData.isAccepted === false) {
      throw new ApiError('End user cannot set isAccepted to false!');
    }
    else if (reqUser.role !== roles.endUser && updatedData.isAccepted
      && updatedData.isAccepted === true) {
      throw new ApiError('Admin cannot approve offer!');
    }

    const updateObject = updatedData;

    if (updatedData.items) {
      updateObject.items = updatedData.items.map((item) => this.itemFactory({
        ...item,
        offerId: id
      }));
    }

    await this.offerRepo.update(id, updateObject);
    const updatedOffer = await this.offerRepo.getOne(id);
    return Object.keys(updatedData)
      .reduce((obj, key) => {
        const propObj = obj;
        propObj[key] = updatedOffer[key];
        return propObj;
      }, {});
  }

  async destroyOffer(id, reqUser) {
    const offer = await this.offerRepo.getOne(id);

    if (!offer) {
      throw new NotFoundError('Offer not found!');
    }

    const request = await this.requestRepo.getOne(offer.requestId);
    if (reqUser.role === roles.admin && request.partner.region.id !== reqUser.region) {
      throw new ForbiddenError(INVALID_REGION);
    }
    if (reqUser.role === roles.partnerAdmin && !request.partner.admins.find(
      (admin) => admin.id !== reqUser.id
    )) {
      throw new ForbiddenError(ADMIN_NOT_PARTNER_ADMIN);
    }
    if (reqUser.role === roles.driver && request.driver.id !== reqUser.id) {
      throw new ForbiddenError('Driver not from offer\'s request');
    }

    await this.offerRepo.destroy(id);
  }
}
