import { Op } from 'sequelize';
import { BaseRepo } from '../../../utils/BaseRepo.js';
import { Tire } from './Tire.js';
import { Tire as TireModel } from '../../../db/index.js';

export class TireRepository extends BaseRepo {
  constructor() {
    super(TireModel);
  }

  buildEntity({
    id,
    brand,
    count,
    width,
    ratio,
    type,
    used,
    carId,
    comment = '',
    tiresHotel = ''
  }) {
    return new Tire(
      id,
      brand,
      count,
      width,
      ratio,
      type,
      used,
      carId,
      comment,
      tiresHotel
    );
  }

  async getAllByCar(carId) {
    const collection = await this.dbClient.findAll({
      where: { carId }
    });

    return collection.map((entity) => this.buildEntity(entity));
  }

  async getAllByCars(carIds, options = {}) {
    const collection = await this.dbClient.findAll({
      where: {
        carId: {
          [Op.in]: carIds
        }
      },
      ...options
    });

    return collection.map((entity) => this.buildEntity(entity));
  }
}
