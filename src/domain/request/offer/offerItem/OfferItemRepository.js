import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { BaseRepo, MAX_PER_PAGE } from '../../../../utils/BaseRepo.js';
import { OfferItem as OfferItemModel } from '../../../../db/index.js';
import { OfferItem } from './OfferItem.js';

export class OfferItemRepository extends BaseRepo {
  constructor() {
    super(OfferItemModel);
  }

  generateId() {
    return uuidv4();
  }

  buildEntity(model) {
    return new OfferItem(
      model.id,
      model.name,
      model.value,
      model.offerId
    );
  }

  async getAll(page = 1, options = {}, order = ['name'], entitiesPerPage = MAX_PER_PAGE) {
    return super.getAll(page, order, options, entitiesPerPage);
  }

  async getOne(id, options = {}) {
    const entity = await this.dbClient.findByPk(id, {
      ...options
    });
    if (!entity) return null;
    return this.buildEntity(entity);
  }

  async create({
    id, name, value, offerId
  }, options = {}) {
    return super.create({
      id, name, value, offerId
    }, options);
  }

  async destroyAllByOffer(offerId, options = {}) {
    await this.dbClient.destroy({
      where: {
        offerId
      },
      ...options
    });
  }

  async getAllByOfferIds(offerIds) {
    const collection = await this.dbClient.findAll({
      where: {
        offerId: {
          [Op.in]: offerIds
        }
      }
    });

    return collection.map((entity) => this.buildEntity(entity));
  }

  async createMany(items, options = {}) {
    return this.dbClient.bulkCreate(items, options);
  }
}
