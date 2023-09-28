import { v4 as uuidv4 } from 'uuid';
import { BaseRepo, MAX_PER_PAGE } from '../../../utils/BaseRepo.js';
import {
  Offer as OfferModel, OfferItem, Request, Region, Partner
} from '../../../db/index.js';
import { Offer } from './Offer.js';
import { OfferItemRepository } from './offerItem/OfferItemRepository.js';

export class OfferRepository extends BaseRepo {
  constructor() {
    super(OfferModel);
    this.offerItemRepo = new OfferItemRepository();
  }

  generateId() {
    return uuidv4();
  }

  buildEntity(model) {
    return new Offer(
      model.id,
      model.title,
      model.requestId,
      model.isAccepted,
      model.offer_items
    );
  }

  async getAll(page = 1, options = {}, order = ['title'], entitiesPerPage = MAX_PER_PAGE) {
    const {
      rows, count
    } = await this.dbClient.findAndCountAll({
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      include: OfferItem,
      ...options
    });

    return {
      total: count,
      data: rows.map((entity) => this.buildEntity(entity)),
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async getAllByRegion(page, region, options = {}, order = ['title'], entitiesPerPage = MAX_PER_PAGE) {
    const {
      rows, count
    } = await this.dbClient.findAndCountAll({
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      include: [
        { model: Request, include: { model: Partner, include: { model: Region, as: 'region' } } }
      ],
      where: {
        '$request.partner.region.id$': region
      },
      ...options
    });

    const items = await this.offerItemRepo.getAllByOfferIds(rows.map((entity) => entity.id));

    return {
      total: count,
      data: rows.map((entity) => {
        const offer = entity;
        offer.offer_items = items.filter((item) => item.offerId === offer.id);
        return this.buildEntity(offer);
      }),
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async getAllByOrganizationAdmin(page, organizationId, options = {}, order = ['title'], entitiesPerPage = MAX_PER_PAGE) {
    const {
      rows, count
    } = await this.dbClient.findAndCountAll({
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      include: [
        { model: Request, include: { model: Partner } }
      ],
      where: {
        '$request.partner.organizationId$': organizationId
      },
      ...options
    });

    const items = await this.offerItemRepo.getAllByOfferIds(rows.map((entity) => entity.id));

    return {
      total: count,
      data: rows.map((entity) => {
        const offer = entity;
        offer.offer_items = items.filter((item) => item.offerId === offer.id);
        return this.buildEntity(offer);
      }),
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async getAllByDriver(page, driverId, options = {}, order = ['title'], entitiesPerPage = MAX_PER_PAGE) {
    const {
      rows, count
    } = await this.dbClient.findAndCountAll({
      order,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      include: [
        { model: Request, as: 'request' }
      ],
      where: {
        '$request.driverId$': driverId
      },
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
      include: OfferItem,
      ...options
    });
    if (!entity) return null;

    return this.buildEntity(entity);
  }

  async create({
    id, title, requestId, isAccepted
  }) {
    return super.create({
      id, title, requestId, isAccepted
    });
  }

  async update(id, {
    title, requestId, isAccepted, items
  }) {
    const updateObject = {};
    if (title) {
      updateObject.title = title;
    }
    if (requestId) {
      updateObject.requestId = requestId;
    }
    if (isAccepted) {
      updateObject.isAccepted = isAccepted;
    }
    await super.update(id, updateObject);
    if (items) {
      await this.offerItemRepo.destroyAllByOffer(id);
      await this.offerItemRepo.createMany(items);
    }
  }

  async destroy(id, options = {}) {
    await super.destroy(id, options);
    await this.offerItemRepo.destroyAllByOffer(id);
  }
}
