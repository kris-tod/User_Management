export const MAX_PER_PAGE = 5;

export class BaseRepo {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  async getAll(page = 1, order = ['id'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const { count, rows } = await this.dbClient.findAndCountAll({
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      ...options
    });

    return {
      total: count, data: rows, limit: entitiesPerPage, offset: entitiesPerPage * (page - 1)
    };
  }

  async getOne(id) {
    const entity = await this.dbClient.findOne({
      where: { id }
    });

    return entity;
  }

  async create(entity) {
    return this.dbClient.create(entity);
  }

  async update(id, updatedData, propObj) {
    return this.dbClient.update(updatedData, { where: { id }, ...propObj });
  }

  async destroy(id) {
    await this.dbClient.destroy({ where: { id } });
  }
}
