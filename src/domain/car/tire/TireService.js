import { TireRepository } from './TireRepository.js';
import { Tire } from './Tire.js';

export class TireService {
  constructor(logger) {
    this.logger = logger;
    this.tireRepo = new TireRepository();
  }

  async getAll(carId) {
    return this.tireRepo.getAllByCar(carId);
  }

  async getOne(tireId) {
    return this.tireRepo.getOne(tireId);
  }

  async tireFactory({
    brand, count, width, ratio, type, used, carId, comment, tireHotel
  }) {
    return new Tire(
      undefined,
      brand,
      count,
      width,
      ratio,
      type,
      used,
      carId,
      comment,
      tireHotel
    );
  }

  async create(carId, tireData) {
    const tire = await this.tireFactory({
      ...tireData,
      carId
    });
    const result = await this.tireRepo.create(tire);

    return result;
  }

  async update(tireId, updatedData) {
    await this.tireRepo.update(tireId, updatedData);

    const tire = await this.tireRepo.getOne(tireId);
    return tire;
  }

  async destroy(tireId) {
    await this.tireRepo.destroy(tireId);
  }
}
