import { Op } from 'sequelize';
import { MAX_PER_PAGE, BaseRepo } from '../../../utils/BaseRepo.js';
import { Car } from './Car.js';
import { Car as CarModel, UserCar } from '../../../db/index.js';
import { TireRepository } from './tire/TireRepository.js';
import { NotFoundError } from '../../../utils/errors.js';

export class CarRepository extends BaseRepo {
  constructor() {
    super(CarModel);
    this.tireRepo = new TireRepository();
    this.userCar = UserCar;
  }

  async getAll(
    page = 1,
    order = ['id'],
    options = {},
    entitiesPerPage = MAX_PER_PAGE
  ) {
    const collection = await super.getAll(
      page,
      order,
      options,
      entitiesPerPage
    );

    return collection.map((entity) => Car.build(entity.toJSON()));
  }

  async getByIdNumber(idNumber) {
    const entity = await this.dbClient.findOne({
      where: {
        idNumber
      }
    });

    const tires = await this.tireRepo.getAllByCar(entity.id);

    return Car.build({
      ...entity.toJSON(),
      tires
    });
  }

  async getAllByIds(carIds) {
    const collection = await this.dbClient.findAll({
      where: {
        id: {
          [Op.in]: carIds
        }
      }
    });

    const cars = collection.map((entity) => Car.build(entity.toJSON()));
    const tires = await this.tireRepo.getAllByCars(carIds);

    return cars.map((carParam) => {
      const car = carParam;
      car.tires = tires.filter((tire) => tire.carId === carParam.id);
      return car;
    });
  }

  async getOne(id) {
    const entity = await super.getOne(id);

    if (!entity) {
      throw new NotFoundError('Car not found!');
    }

    const tires = await this.tireRepo.getAllByCar(id);

    return Car.build({
      ...entity.toJSON(),
      tires
    });
  }

  async getUserCars(userId) {
    const relations = await this.userCar.findAll({
      where: {
        userId
      }
    });

    const cars = await this.getAllByIds(relations.map((rel) => rel.toJSON().carId));
    return cars;
  }

  async addCar(userId, carData) {
    await this.create(carData);

    const car = await this.getByIdNumber(carData.idNumber);
    await this.userCar.create({ carId: car.id, userId });
  }
}
