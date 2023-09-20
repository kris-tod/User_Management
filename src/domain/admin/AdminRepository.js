import { Op } from 'sequelize';
import { BaseRepo, MAX_PER_PAGE } from '../../utils/BaseRepo.js';
import { Admin as AdminModel, Region } from '../../db/index.js';
import { Admin } from './Admin.js';
import { RegionRepository } from '../region/RegionRepository.js';
import { NotFoundError } from '../../utils/errors.js';
import { USER_NOT_FOUND } from '../../constants/messages.js';

export class AdminRepository extends BaseRepo {
  constructor() {
    super(AdminModel);
    this.regionRepo = new RegionRepository();
  }

  buildEntity(model) {
    return new Admin(
      model.id,
      model.username,
      model.password,
      model.role,
      model.region,
      model.email
    );
  }

  async getAll(page = 1, regionProp = '', entitiesPerPage = MAX_PER_PAGE) {
    const options = {};

    if (regionProp) {
      options.where = { regionId: regionProp };
    }

    const { count, rows } = await this.dbClient.findAndCountAll({
      include: [Region]
    });

    const result = {
      total: count,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      data: rows.map((entity) => this.buildEntity(entity))
    };

    return result;
  }

  async getOne(id) {
    const entity = await this.dbClient.findByPk(id, {
      include: [Region]
    });

    if (!entity) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    return this.buildEntity(entity);
  }

  async getAllByIds(listOfIds, options = {}) {
    const collection = await this.dbClient.findAll({
      include: [Region],
      where: {
        id: {
          [Op.in]: listOfIds
        }
      },
      ...options
    });

    return collection.map((entity) => this.buildEntity(entity));
  }

  async getOneByUsername(username) {
    const userData = await this.dbClient.findOne({
      include: [Region],
      where: { username }
    });

    if (!userData) {
      return null;
    }

    return this.buildEntity(userData);
  }
}
