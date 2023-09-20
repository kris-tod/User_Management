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
      model.id,
      model.name,
      model.image,
      model.region,
      model.isRegionDefault,
      model.isPromoted,
      model.description
    );
  }

  async getAllByIds(listOfIds, options = {}) {
    const collection = await this.dbClient.findAll({
      include: [Region],
      order: [['isPromoted', 'DESC'], 'name'],
      where: {
        id: {
          [Op.in]: listOfIds
        }
      },
      ...options
    });

    return collection.map((entity) => this.buildEntity(entity));
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
    const entity = await this.dbClient.findByPk(id, {
      include: [Region]
    });

    if (!entity) {
      throw new NotFoundError(SERVICE_NOT_FOUND);
    }

    return this.buildEntity(entity);
  }
}
