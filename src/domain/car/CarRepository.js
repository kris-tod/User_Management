import { Op } from 'sequelize';
import { BaseRepo } from '../../utils/BaseRepo.js';
import { Car } from './Car.js';
import { Car as CarModel, UserCar, Tire } from '../../db/index.js';
import { TireRepository } from './tire/TireRepository.js';
import { NotFoundError } from '../../utils/errors.js';
import { ENTITY_NOT_FOUND } from '../../constants/messages.js';

export class CarRepository extends BaseRepo {
  constructor() {
    super(CarModel);
    this.tireRepo = new TireRepository();
    this.userCar = UserCar;
  }

  buildEntity(model) {
    return new Car(
      model.id,
      model.idNumber,
      model.image,
      model.brand,
      model.kilometers,
      model.engineType,
      model.tires,
      model.yearOfProduction,
      model.frameNumber,
      model.technicalReviewExpiration,
      model.civilEnsuranceExpiration,
      model.vignetteExpiration,
      model.autoEnsuranceExpiration,
      model.leasingExpiration,
      model.comment,
      model.vehicleType
    );
  }

  async getByIdNumber(idNumber) {
    const entity = await this.dbClient.findOne({
      where: {
        idNumber
      }
    });

    const tires = await this.tireRepo.getAllByCar(entity.id);

    entity.tires = tires;

    return this.buildEntity(entity);
  }

  async getAllByIds(carIds, options = {}) {
    const collection = await this.dbClient.findAll({
      where: {
        id: {
          [Op.in]: carIds
        }
      },
      ...options
    });

    const cars = collection.map((entity) => this.buildEntity(entity));
    const tires = await this.tireRepo.getAllByCars(carIds, options);

    return cars.map((carParam) => {
      const car = carParam;
      car.tires = tires.filter((tire) => tire.carId === carParam.id);
      return car;
    });
  }

  async getOne(carId, options = {}) {
    const entity = await this.dbClient.findByPk(carId, {
      include: [Tire],
      ...options
    });

    if (!entity) {
      throw new NotFoundError(ENTITY_NOT_FOUND);
    }

    return entity;
  }

  async getUserCars(userId) {
    const relations = await this.userCar.findAll({
      where: {
        userId
      }
    });

    const cars = await this.getAllByIds(
      relations.map((rel) => rel.carId)
    );
    return cars;
  }

  async addCar(userId, carData) {
    await this.create(carData);

    const car = await this.getByIdNumber(carData.idNumber);
    await this.userCar.create({ carId: car.id, userId });
  }
}
