import { ApiError } from '../../utils/errors.js';
import { UserRepository } from '../user/UserRepository.js';
import { CarRepository } from './CarRepository.js';
import { TireRepository } from './tire/TireRepository.js';
import FileService from '../../services/FileService.js';
import { Car } from './Car.js';

export class CarService {
  constructor(logger) {
    this.logger = logger;
    this.carRepo = new CarRepository();
    this.tireRepo = new TireRepository();
    this.userRepo = new UserRepository();
  }

  async getAll(reqUser) {
    return this.carRepo.getUserCars(reqUser.id);
  }

  async getOne(carId) {
    return this.carRepo.getOne(carId);
  }

  async getTires(carId) {
    return this.tireRepo.getAllByCar(carId);
  }

  async carFactory({
    idNumber,
    image,
    brand,
    kilometers,
    engineType,
    yearOfProduction,
    frameNumber,
    technicalReviewExpiration,
    civilEnsuranceExpiration,
    vignetteExpiration,
    autoEnsuranceExpiration,
    leasingExpiration,
    comment,
    vehicleType
  }) {
    return new Car(
      undefined,
      idNumber,
      image,
      brand,
      kilometers,
      engineType,
      [],
      yearOfProduction,
      frameNumber,
      technicalReviewExpiration,
      civilEnsuranceExpiration,
      vignetteExpiration,
      autoEnsuranceExpiration,
      leasingExpiration,
      comment,
      vehicleType
    );
  }

  async create(carData, reqUser) {
    const car = await this.carFactory(carData);
    const result = await this.carRepo.addCar(reqUser.id, car);
    return result;
  }

  async update(carId, updatedData) {
    await this.carRepo.update(carId, updatedData);

    const car = await this.carRepo.getOne(carId);
    return car;
  }

  async updateImage(carId, file) {
    await this.carRepo.update(carId, { image: FileService.getFilePath(file) });

    const car = await this.carRepo.getOne(carId);

    return {
      image: car.image
    };
  }

  async destroy(carId, reqUser) {
    const cars = await this.getAll(reqUser);

    if (!cars.find((car) => car.id === `${carId}`)) {
      throw new ApiError('Car is not yours!');
    }

    await this.carRepo.destroy(carId);
  }
}

// - get user cars
// - add car to user
// - edit car
// - add tires to car
// - edit tires
//
//
//
