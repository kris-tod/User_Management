import { Op } from 'sequelize';
import { BaseRepo } from '../../../utils/BaseRepo.js';
import { Tire } from './Tire.js';
import { Tire as TireModel } from '../../../db/index.js';

const buildTire = ({
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
}) => new Tire(
  parseInt(id, 10),
  brand,
  count,
  width,
  ratio,
  type,
  used,
  parseInt(carId, 10),
  comment,
  tiresHotel
);

export class TireRepository extends BaseRepo {
  constructor() {
    super(TireModel);
  }

  async getAllByCar(carId) {
    const collection = await this.dbClient.findAll({
      where: { carId }
    });

    return collection.map((entity) => buildTire(entity));
  }

  async getAllByCars(carIds) {
    const collection = await this.dbClient.findAll({
      where: {
        carId: {
          [Op.in]: carIds
        }
      }
    });

    return collection.map((entity) => buildTire(entity));
  }
}
