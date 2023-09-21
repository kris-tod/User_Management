import {
  Organization as OrganizationModel, Partner
} from '../../db/index.js';
import { Organization } from './Organization.js';
import { PartnerRepository } from '../partners/PartnerRepository.js';
import { BaseRepo, MAX_PER_PAGE } from '../../utils/BaseRepo.js';
import { NotFoundError } from '../../utils/errors.js';
import { ENTITY_NOT_FOUND } from '../../constants/messages.js';

export class OrganizationRepository extends BaseRepo {
  constructor() {
    super(OrganizationModel);
    this.partnerRepo = new PartnerRepository();
  }

  buildEntity(model) {
    return new Organization(
      model.id,
      model.name,
      model.description,
      model.partners
    );
  }

  async getAll(page = 1, order = ['name'], options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const {
      count, rows
    } = await this.dbClient.findAndCountAll({
      include: [
        {
          model: Partner
        }],
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
    const entity = await this.dbClient.findByPk(id, {
      include: [Partner],
      ...options
    });

    if (!entity) {
      throw new NotFoundError(ENTITY_NOT_FOUND);
    }

    return this.buildEntity(entity);
  }
}
