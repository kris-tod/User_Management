import { Op } from 'sequelize';
import { BaseRepo } from '../../../../utils/BaseRepo.js';
import { Tire } from './Tire.js';
import { Tire as TireModel } from '../../../../db/index.js';

export class TireRepository extends BaseRepo {
  constructor() {
    super(TireModel);
  }

  async getAllByCar(carId) {
    const collection = await this.dbClient.findAll({
      where: { carId }
    });

    return collection.map((entity) => Tire.build(entity.toJSON()));
  }

  async getAllByCars(carIds) {
    const collection = await this.dbClient.findAll({
      where: {
        carId: {
          [Op.in]: carIds
        }
      }
    });

    return collection.map((entity) => Tire.build(entity.toJSON()));
  }
}
