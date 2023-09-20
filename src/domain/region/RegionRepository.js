import { BaseRepo, MAX_PER_PAGE } from '../../utils/BaseRepo.js';
import { Region as RegionModel, Driver } from '../../db/index.js';
import { NotFoundError } from '../../utils/errors.js';
import { Region } from './Region.js';

const buildRegion = (model) => new Region(parseInt(model.id, 10), model.name, model.driver);

export class RegionRepository extends BaseRepo {
  constructor() {
    super(RegionModel);
  }

  async getAll(page = 1, options = {}, order = ['id'], entitiesPerPage = MAX_PER_PAGE) {
    const {
      count, rows
    } = await this.dbClient.findAndCountAll({
      include: [Driver],
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      ...options
    });

    return {
      total: count,
      data: rows.map((entity) => buildRegion(entity)),
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async getOne(id, options = {}) {
    const entity = await this.dbClient.findByPk(id, {
      include: [Driver],
      ...options
    });
    if (!entity) {
      throw new NotFoundError('Region not found!');
    }
    const result = buildRegion(entity);
    return result;
  }
}
