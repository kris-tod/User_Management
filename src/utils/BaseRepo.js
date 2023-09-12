export const MAX_PER_PAGE = 5;

export class BaseRepo {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  async getAll(page = 1, order = ['id'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const collection = await this.dbClient.findAll({
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      ...options
    });

    return collection;
  }

  async getOne(id) {
    const entity = await this.dbClient.findOne({
      where: { id }
    });

    return entity;
  }

  async create(entity) {
    await this.dbClient.create(entity);
  }

  async update(id, updatedData, propObj) {
    await this.dbClient.update(updatedData, { where: { id }, ...propObj });
  }

  async destroy(id) {
    await this.dbClient.destroy({ where: { id } });
  }
}
