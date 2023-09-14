import { Op } from 'sequelize';
import { MAX_PER_PAGE, BaseRepo } from '../../utils/BaseRepo.js';
import { Car } from './Car.js';
import { Car as CarModel, UserCar } from '../../db/index.js';
import { TireRepository } from './tire/TireRepository.js';
import { NotFoundError } from '../../utils/errors.js';

const buildCar = (model) => new Car(
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

    return collection.map((entity) => buildCar(entity));
  }

  async getByIdNumber(idNumber) {
    const entity = await this.dbClient.findOne({
      where: {
        idNumber
      }
    });

    const tires = await this.tireRepo.getAllByCar(entity.id);

    entity.tires = tires;

    return buildCar(entity);
  }

  async getAllByIds(carIds) {
    const collection = await this.dbClient.findAll({
      where: {
        id: {
          [Op.in]: carIds
        }
      }
    });

    const cars = collection.map((entity) => buildCar(entity));
    const tires = await this.tireRepo.getAllByCars(carIds);

    return cars.map((carParam) => {
      const car = carParam;
      car.tires = tires.filter((tire) => tire.carId === carParam.id);
      return car;
    });
  }

  async getOne(carId) {
    const entity = await super.getOne(carId);

    if (!entity) {
      throw new NotFoundError('Car not found!');
    }

    const tires = await this.tireRepo.getAllByCar(carId);

    entity.tires = tires;
    return buildCar(entity);
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
