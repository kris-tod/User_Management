import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { BaseRepo, MAX_PER_PAGE } from '../../utils/BaseRepo.js';
import {
  Request as RequestModel, Partner, Driver, Car, CarSupportService, Admin, Region,
  UserCar, Offer, OfferItem, RequestProtocol
} from '../../db/index.js';
import { Request } from './Request.js';
import { ENTITY_NOT_FOUND } from '../../constants/messages.js';
import { NotFoundError } from '../../utils/errors.js';
import { AdminRepository } from '../admin/AdminRepository.js';
import { ProtocolRepository } from './protocol/ProtocolRepository.js';

export class RequestRepository extends BaseRepo {
  constructor() {
    super(RequestModel);
    this.adminRepo = new AdminRepository();
    this.protocolRepo = new ProtocolRepository();
  }

  generateId() {
    return uuidv4();
  }

  buildEntity(model) {
    return new Request(
      model.id,
      model.address,
      model.carCoordinates,
      model.partner,
      model.car_support_service,
      model.car,
      model.driver,
      model.driveAlone,
      model.status,
      model.serialNumber || -1,
      model.notes || '',
      model.offers,
      model.request_protocol
    );
  }

  async getAll(page = 1, order = ['id'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const {
      count, rows
    } = await this.dbClient.findAndCountAll({
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      include: [
        { model: Partner, as: 'partner' },
        Driver,
        Car,
        CarSupportService,
        { model: Offer, include: OfferItem },
        {
          model: RequestProtocol,
          include: [
            { association: 'preliminaryProtocol' },
            { association: 'transmissiveProtocol' }
          ]
        }
      ],
      ...options
    });

    return {
      total: count,
      data: rows.map((entity) => this.buildEntity(entity)),
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async getAllByRegion(page, region, order = ['id'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const {
      rows, count
    } = await this.dbClient.findAndCountAll({
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      include: [
        { model: Partner, as: 'partner' },
        Driver,
        Car,
        CarSupportService,
        { model: Offer, include: OfferItem },
        {
          model: RequestProtocol,
          include: [
            { association: 'preliminaryProtocol' },
            { association: 'transmissiveProtocol' }
          ]
        }
      ],
      where: {
        '$partner.regionId$': region
      },
      ...options
    });

    return {
      total: count,
      data: rows.map((entity) => this.buildEntity(entity)),
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async getAllByAdmin(page, adminId, order = ['id'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const {
      rows, count
    } = await this.dbClient.findAndCountAll({
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      include: [
        {
          model: Partner,
          include: [
            { model: Admin, where: { id: adminId }, require: true }
          ]
        },
        Driver,
        Car,
        CarSupportService,
        { model: Offer, include: OfferItem },
        {
          model: RequestProtocol,
          include: [
            { association: 'preliminaryProtocol' },
            { association: 'transmissiveProtocol' }
          ]
        }
      ],
      ...options
    });

    return {
      total: count,
      data: rows.map((entity) => this.buildEntity(entity)),
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async getAllByUser(page, userId, order = ['id'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const carsIds = (await UserCar.findAll({
      where: {
        userId
      }
    })).map((entity) => entity.carId);

    return this.getAll(page, order, {
      where: {
        carId: {
          [Op.in]: carsIds
        }
      },
      ...options
    }, entitiesPerPage);
  }

  async getAllByOrganizationAdmin(page, adminId, order = ['id'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const admin = await this.adminRepo.getOne(adminId);
    return this.getAll(page, order, {
      where: {
        '$partner.organizationId$': admin.organization.id
      },
      ...options
    }, entitiesPerPage);
  }

  async getAllByDriver(page, driverId, order = ['id'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    return this.getAll(page, order, {
      where: {
        driverId
      },
      ...options
    }, entitiesPerPage);
  }

  async getOne(id, options = {}) {
    const entity = await this.dbClient.findByPk(id, {
      include: [
        { model: Partner, include: [Region, Admin] },
        Driver,
        Car,
        CarSupportService,
        { model: Offer, include: OfferItem },
        {
          model: RequestProtocol,
          include: [
            { association: 'preliminaryProtocol' },
            { association: 'transmissiveProtocol' }
          ]
        }
      ],
      ...options
    });

    if (!entity) {
      throw new NotFoundError(ENTITY_NOT_FOUND);
    }

    return this.buildEntity(entity);
  }

  async create(entity) {
    return super.create({
      id: entity.id,
      address: entity.address,
      carCoordinates: entity.carCoordinates,
      partnerId: entity.partner.id,
      carId: entity.car.id,
      driverId: (entity.driver ? entity.driver.id : null),
      carSupportServiceId: entity.service.id,
      driveAlone: entity.driveAlone,
      serialNumber: entity.serialNumber,
      status: entity.status
    });
  }

  async addOrReplacePreliminaryProtocol(requestId, protocolData, options = {}) {
    const protocol = await this.protocolRepo.create(protocolData, options);
    const requestProtocols = await RequestProtocol.findOne({
      where: {
        requestId
      },
      ...options
    });

    if (!requestProtocols) {
      await RequestProtocol.create({
        requestId, preliminaryId: protocol.id, transmissiveId: null
      }, options);
      return protocol;
    }
    requestProtocols.preliminaryId = protocol.id;
    await requestProtocols.save(options);

    return protocol;
  }

  async addOrReplaceTransmissiveProtocol(requestId, protocolData, options = {}) {
    const protocol = await this.protocolRepo.create(protocolData, options);
    const requestProtocols = await RequestProtocol.findOne({
      where: {
        requestId
      },
      ...options
    });

    if (!requestProtocols) {
      await RequestProtocol.create({
        requestId, preliminaryId: null, transmissiveId: protocol.id
      }, options);
      return protocol;
    }
    requestProtocols.transmissiveId = protocol.id;
    await requestProtocols.save(options);

    return protocol;
  }
}
