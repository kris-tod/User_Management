import { TireRepository } from './TireRepository.js';

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

  async create(carId, tireData) {
    await this.tireRepo.create({
      ...tireData,
      carId
    });

    const tires = await this.tireRepo.getAllByCar(carId);
    return tires;
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
