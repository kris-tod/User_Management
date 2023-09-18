import { Op } from 'sequelize';
import { BaseRepo } from '../../../../utils/BaseRepo.js';
import { CarSupportService as CarSupportServiceModel } from '../../../../db/index.js';
import { CarSupportService } from './CarSupportService.js';
import { NotFoundError } from '../../../../utils/errors.js';
import { SERVICE_NOT_FOUND } from '../../../../constants/messages.js';

const buildService = (model) => new CarSupportService(
  parseInt(model.id, 10),
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
    const collectionPromoted = await this.dbClient.findAll({
      where: {
        id: {
          [Op.in]: listOfIds
        },
        isPromoted: true
      }
    });

    const collectionNotPromoted = await this.dbClient.findAll({
      where: {
        id: {
          [Op.in]: listOfIds
        },
        isPromoted: false
      }
    });

    return collectionPromoted.map((entity) => buildService(entity))
      .concat(collectionNotPromoted.map((entity) => buildService(entity)));
  }

  async getAll(page, order, options) {
    const {
      total, data, limit, offset
    } = await super.getAll(page, order, options);
    const listOfIds = data
      .map((entity) => entity.id);

    return {
      total, limit, offset, data: await this.getAllByIds(listOfIds)
    };
  }

  async getOne(id) {
    const entity = await super.getOne(id);
    if (!entity) {
      throw new NotFoundError(SERVICE_NOT_FOUND);
    }
    return buildService(entity);
  }
}
