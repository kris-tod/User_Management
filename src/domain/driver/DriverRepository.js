import { Driver as DriverModel, Region, Partner } from '../../db/index.js';
import { BaseRepo, MAX_PER_PAGE } from '../../utils/BaseRepo.js';
import { NotFoundError } from '../../utils/errors.js';
import { PartnerRepository } from '../partners/PartnerRepository.js';
import { RegionRepository } from '../region/RegionRepository.js';
import { Driver } from './Driver.js';

export class DriverRepository extends BaseRepo {
  constructor() {
    super(DriverModel);
    this.regionRepo = new RegionRepository();
    this.partnerRepo = new PartnerRepository();
  }

  buildEntity(model) {
    return new Driver(
      model.id,
      model.name,
      model.password,
      model.avatar,
      model.number,
      model.region,
      model.partner,
      model.pushNotificationsToken,
      model.signature,
      model.description
    );
  }

  async getAll(page = 1, order = ['name'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const {
      count, rows
    } = await this.dbClient.findAndCountAll({
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      include: [
        { model: Region, required: false },
        { model: Partner, required: false }
      ],
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
    const entity = await this.dbClient.findByPk(id, {
      include: [Region, Partner],
      ...options
    });

    return this.buildEntity(entity);
  }

  async getByName(name, options = {}) {
    const entity = await this.dbClient.findOne({
      include: [Region],
      where: {
        name
      },
      ...options
    });

    if (!entity) {
      throw new NotFoundError('Driver not found!');
    }

    return this.buildEntity(entity);
  }

  async create(data, options = {}) {
    const entity = await super.create(data, options);
    return this.getOne(entity.id, options);
  }
}
