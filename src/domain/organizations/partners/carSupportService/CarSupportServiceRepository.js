import { Op } from 'sequelize';
import { BaseRepo } from '../../../../utils/BaseRepo.js';
import { CarSupportService as CarSupportServiceModel } from '../../../../db/index.js';
import { CarSupportService } from './CarSupportService.js';

const buildService = (model) => new CarSupportService(
  model.id,
  model.name,
  model.image,
  model.region,
  model.isRegionDefault,
  model.isPromoted,
  model.description
);

export class CarSupportServiceRepository extends BaseRepo {
  constructor() {
    super(CarSupportServiceModel);
  }

  async getAllByIds(listOfIds) {
    const collection = await this.dbClient.findAll({
      where: {
        id: {
          [Op.in]: listOfIds
        }
      }
    });

    return collection.map((entity) => buildService(entity));
  }

  async getAll(page, order, options) {
    const collection = await super.getAll(page, order, options);

    return collection.map((entity) => buildService(entity));
  }

  async getOne(id) {
    const entity = await super.getOne(id);
    return buildService(entity);
  }
}
