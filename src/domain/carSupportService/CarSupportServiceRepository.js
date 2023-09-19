import { Op } from 'sequelize';
import { BaseRepo, MAX_PER_PAGE } from '../../utils/BaseRepo.js';
import { CarSupportService as CarSupportServiceModel, Region } from '../../db/index.js';
import { CarSupportService } from './CarSupportService.js';
import { NotFoundError } from '../../utils/errors.js';
import { SERVICE_NOT_FOUND } from '../../constants/messages.js';
import { RegionRepository } from '../region/RegionRepository.js';

export class CarSupportServiceRepository extends BaseRepo {
  constructor() {
    super(CarSupportServiceModel);
    this.regionRepo = new RegionRepository();
  }

  buildEntity(model) {
    return new CarSupportService(
      parseInt(model.id, 10),
      model.name,
      model.image,
      model.region,
      model.isRegionDefault,
      model.isPromoted,
      model.description
    );
  }

  async getAllByIds(listOfIds, options = {}) {
    const collectionPromoted = await this.dbClient.findAll({
      where: {
        id: {
          [Op.in]: listOfIds
        },
        isPromoted: true
      },
      ...options
    });

    const collectionNotPromoted = await this.dbClient.findAll({
      where: {
        id: {
          [Op.in]: listOfIds
        },
        isPromoted: false
      },
      ...options
    });

    const resultPromoted = await Promise.all(collectionPromoted.map(async (entity) => {
      const service = entity;
      service.region = await this.regionRepo.getOne(service.regionId, options);
      return this.buildEntity(service);
    }));

    const resultNotPromoted = await Promise.all(collectionNotPromoted.map(async (entity) => {
      const service = entity;
      service.region = await this.regionRepo.getOne(service.regionId, options);
      return this.buildEntity(service);
    }));

    return resultPromoted.concat(resultNotPromoted);
  }

  async getAll(page = 1, options = {}, order = [['isPromoted', 'DESC'], 'name'], entitiesPerPage = MAX_PER_PAGE) {
    const { rows, count } = await this.dbClient.findAndCountAll({
      include: [Region],
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      ...options
    });

    return {
      total: count,
      data: rows.map((entity) => this.buildEntity(entity)),
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async getOne(id) {
    const entity = await this.dbClient.findOne({
      include: [Region],
      where: { id }
    });

    if (!entity) {
      throw new NotFoundError(SERVICE_NOT_FOUND);
    }

    return this.buildEntity(entity);
  }
}
