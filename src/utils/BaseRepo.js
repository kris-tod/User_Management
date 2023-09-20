export const MAX_PER_PAGE = 5;

export class BaseRepo {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  buildEntity(entity) {
    return entity.toJSON();
  }

  async getAll(page = 1, order = ['id'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const { count, rows } = await this.dbClient.findAndCountAll({
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      ...options
    });

    return {
      total: count,
      data: rows.map((entity) => this.buildEntity(entity)),
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async getOne(id, options = {}) {
    const entity = await this.dbClient.findByPk(id, options);
    return this.buildEntity(entity);
  }

  async create(entity, options = {}) {
    return this.dbClient.create(entity, options);
  }

  async update(id, updatedData, propObj) {
    return this.dbClient.update(updatedData, { where: { id }, ...propObj });
  }

  async destroy(id) {
    await this.dbClient.destroy({ where: { id } });
  }
}
