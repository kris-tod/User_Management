import { MAX_PER_PAGE } from '../constants/domain.js';

export class BaseEntityRepository {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  async getAll(page = 1) {
    const collection = await this.dbClient.findAll({
      order: ['id'],
      limit: MAX_PER_PAGE,
      offset: MAX_PER_PAGE * (page - 1)
    });

    return collection.map((entity) => entity.toJSON());
  }

  async getOne(id) {
    const entity = await this.dbClient.findOne({
      where: { id }
    });

    return entity && entity.toJSON();
  }

  async create(entity) {
    await this.dbClient.create(entity);
  }

  async update(id, updatedData) {
    await this.dbClient.update(updatedData, { where: { id } });
  }

  async destroy(id) {
    await this.dbClient.destroy({ where: { id } });
  }
}
