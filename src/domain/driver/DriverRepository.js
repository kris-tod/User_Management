import { Op } from 'sequelize';
import { Driver as DriverModel, Region, Partner } from '../../db/index.js';
import { BaseRepo, MAX_PER_PAGE } from '../../utils/BaseRepo.js';
import { NotFoundError } from '../../utils/errors.js';
import { PartnerRepository } from '../partners/PartnerRepository.js';
import { RegionRepository } from '../region/RegionRepository.js';
import { Driver } from './Driver.js';
import { DRIVER_NOT_FOUND } from '../../constants/messages.js';
import { AdminRepository } from '../admin/AdminRepository.js';

export class DriverRepository extends BaseRepo {
  constructor() {
    super(DriverModel);
    this.regionRepo = new RegionRepository();
    this.adminRepo = new AdminRepository();
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
        { model: Partner, as: 'partner', required: false }
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

  async getAllByOrganizationAdmin(page, adminId, order = ['name'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const admin = await this.adminRepo.getOne(adminId);
    return this.getAll(page, order, {
      where: {
        '$partner.organizationId$': admin.organization.id
      },
      ...options
    }, entitiesPerPage);
  }

  async getAllByPartnerAdmin(page, adminId, order = ['name'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const partnersIds = (await this.partnerRepo
      .getAllByAdmin(page, adminId, order, options, entitiesPerPage))
      .data
      .map((partner) => partner.id);

    return this.getAll(page, order, {
      where: {
        partnerId: {
          [Op.in]: partnersIds
        }
      }
    }, entitiesPerPage);
  }

  async getOne(id, options = {}) {
    const entity = await this.dbClient.findByPk(id, {
      include: [Region, Partner],
      ...options
    });

    if (!entity) {
      throw new NotFoundError(DRIVER_NOT_FOUND);
    }

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
      throw new NotFoundError(DRIVER_NOT_FOUND);
    }

    return this.buildEntity(entity);
  }

  async create({
    name, password, description, number, pushNotificationsToken, signature, region, partner
  }, options = {}) {
    const entity = await super.create({
      name,
      password,
      description,
      number,
      pushNotificationsToken,
      signature,
      regionId: region.id,
      partnerId: partner.id
    }, options);
    return this.getOne(entity.id, options);
  }
}
