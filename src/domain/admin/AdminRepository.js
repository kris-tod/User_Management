import { Op } from 'sequelize';
import { BaseRepo } from '../../utils/BaseRepo.js';
import { Admin as AdminModel } from '../../db/index.js';
import { Admin } from './Admin.js';
import { RegionRepository } from '../region/RegionRepository.js';
import { NotFoundError } from '../../utils/errors.js';
import { USER_NOT_FOUND } from '../../constants/messages.js';

const buildAdmin = (model) => new Admin(
  parseInt(model.id, 10),
  model.username,
  model.password,
  model.role,
  model.region,
  model.email
);

export class AdminRepository extends BaseRepo {
  constructor() {
    super(AdminModel);
    this.regionRepo = new RegionRepository();
  }

  async getAll(page = 1, regionProp = '') {
    const options = {};

    if (regionProp) {
      options.where = { regionId: regionProp };
    }

    const {
      total, data, limit, offset
    } = await super.getAll(page, ['username'], options);

    const result = {
      total,
      limit,
      offset,
      data: await Promise.all(data.map(async (adminData) => {
        const admin = adminData;
        if (adminData.regionId) {
          admin.region = await this.regionRepo.getOne(adminData.regionId);
        }
        return buildAdmin(admin);
      }))
    };

    return result;
  }

  async getOne(id) {
    const entity = await super.getOne(id);

    if (!entity) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    if (entity.regionId) {
      entity.region = await this.regionRepo.getOne(entity.regionId);
    }

    return buildAdmin(entity);
  }

  async getAllByIds(listOfIds) {
    const collection = await this.dbClient.findAll({
      where: {
        id: {
          [Op.in]: listOfIds
        }
      }
    });

    return Promise.all(collection.map(async (adminData) => {
      const admin = adminData;
      if (admin.regionId) {
        admin.region = await this.regionRepo.getOne(adminData.regionId);
      }
      return buildAdmin(admin);
    }));
  }

  async getOneByUsername(username) {
    const userData = await this.dbClient.findOne({
      where: { username }
    });

    if (!userData) {
      return null;
    }
    if (userData.regionId) {
      userData.region = await this.regionRepo.getOne(userData.regionId);
    }
    return buildAdmin(userData);
  }
}
