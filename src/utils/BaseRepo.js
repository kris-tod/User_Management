const MAX_PER_PAGE = 5;

export class BaseRepo {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  async getAll(page = 1, order = ['id'], entitiesPerPage = MAX_PER_PAGE) {
    const collection = await this.dbClient.findAll({
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
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

  async update(id, updatedData) {
    await this.dbClient.update(updatedData, { where: { id } });
  }

  async destroy(id) {
    await this.dbClient.destroy({ where: { id } });
  }
}
