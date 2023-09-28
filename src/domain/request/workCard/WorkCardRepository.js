import { v4 as uuidv4 } from 'uuid';
import { BaseRepo, MAX_PER_PAGE } from '../../../utils/BaseRepo.js';
import { WorkCardItem, WorkCard as WorkCardModel, sequelize } from '../../../db/index.js';
import { WorkCard } from './WorkCard.js';
import { WorkCardItemRepository } from './workCardItem/WorkCardItemRepository.js';

export class WorkCardRepository extends BaseRepo {
  constructor() {
    super(WorkCardModel);
    this.workCardItemRepo = new WorkCardItemRepository();
  }

  generateId() {
    return uuidv4();
  }

  buildEntity(model) {
    return new WorkCard(model.id, model.work_card_items);
  }

  async getAll(page = 1, options = {}, entitiesPerPage = MAX_PER_PAGE) {
    const {
      count, rows
    } = await this.dbClient.findAndCountAll({
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      include: { model: WorkCardItem, as: 'work_card_items' },
      ...options
    });

    const data = rows.map((entity) => this.buildEntity(entity));
    data.sort((a, b) => {
      const sum1 = a.items.reduce((acc, curr) => acc + curr.value, 0);
      const sum2 = b.items.reduce((acc, curr) => acc + curr.value, 0);
      return sum2 - sum1;
    });

    return {
      total: count,
      data,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async getOne(id, options = {}) {
    const entity = await this.dbClient.findByPk(id, {
      include: WorkCardItem,
      ...options
    });

    if (!entity) {
      return null;
    }

    return this.buildEntity(entity);
  }

  async create(workCard, options = {}) {
    const entity = await super.create({
      id: workCard.id
    }, options);

    const items = await this.workCardItemRepo.createMany(workCard.items, options);
    entity.work_card_items = items;

    return this.buildEntity(entity);
  }
}
