import { v4 as uuidv4 } from 'uuid';
import { BaseRepo, MAX_PER_PAGE } from '../../utils/BaseRepo.js';
import {
  Request as RequestModel, Partner, Driver, Car, CarSupportService, Admin, Region
} from '../../db/index.js';
import { Request } from './Request.js';
import { ENTITY_NOT_FOUND } from '../../constants/messages.js';
import { NotFoundError } from '../../utils/errors.js';

export class RequestRepository extends BaseRepo {
  constructor() {
    super(RequestModel);
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
      model.notes || ''
    );
  }

  async getAll(page = 1, order = ['id'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const {
      count, rows
    } = await this.dbClient.findAndCountAll({
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      include: [Partner, Driver, Car, CarSupportService],
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
      include: [{ model: Partner, as: 'partner' }, Driver, Car, CarSupportService],
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
      include: [ // TODO
        { model: Partner, include: [{ model: Admin }] },
        Driver, Car, CarSupportService],
      ...options
    });

    return {
      total: count,
      data: rows.map((entity) => this.buildEntity(entity)),
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async getOne(id, options = {}) {
    const entity = await this.dbClient.findByPk(id, {
      include: [{ model: Partner, include: [Region] }, Driver, Car, CarSupportService],
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
      driverId: entity.driver.id,
      carSupportServiceId: entity.service.id,
      driveAlone: entity.driveAlone,
      serialNumber: entity.serialNumber,
      status: entity.status
    });
  }
}
