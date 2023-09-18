import { Organization as OrganizationModel } from '../../db/index.js';
import { Organization } from './Organization.js';
import { PartnerRepository } from './partners/PartnerRepository.js';
import { BaseRepo } from '../../utils/BaseRepo.js';
import { NotFoundError } from '../../utils/errors.js';

const buildOrganization = (model) => new Organization(
  parseInt(model.id, 10),
  model.name,
  model.description,
  model.partners
);

export class OrganizationRepository extends BaseRepo {
  constructor() {
    super(OrganizationModel);
    this.partnerRepo = new PartnerRepository();
  }

  async getAll(page = 1) {
    const {
      total, data, limit, offset
    } = await super.getAll(page);

    const listOfIds = data.map((entity) => entity.id);
    const partners = await this.partnerRepo.getAllByOrganizationIds(listOfIds);

    const collection = data.map((entity) => {
      const organization = entity;

      organization.partners = partners.filter(
        (partner) => partner.organizationId === parseInt(organization.id, 10)
      );

      return buildOrganization(organization);
    });

    return {
      total, data: collection, limit, offset
    };
  }

  async getOne(id) {
    const entity = await super.getOne(id);

    if (!entity) {
      throw new NotFoundError('Organization not found!');
    }

    entity.partners = await this.partnerRepo.getAllByOrganizationIds([entity.id]);
    return buildOrganization(entity);
  }
}
