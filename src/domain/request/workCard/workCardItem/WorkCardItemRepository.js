import { v4 as uuidv4 } from 'uuid';
import { WorkCardItem as WorkCardItemModel } from '../../../../db/index.js';
import { BaseRepo } from '../../../../utils/BaseRepo.js';
import { WorkCardItem } from './WorkCardItem.js';

export class WorkCardItemRepository extends BaseRepo {
  constructor() {
    super(WorkCardItemModel);
  }

  generateId() {
    return uuidv4();
  }

  buildEntity(model) {
    return new WorkCardItem(model.id, model.name, model.value, model.workCardId);
  }

  async createMany(items, options = {}) {
    const collection = await this.dbClient.bulkCreate(items, options);
    return collection.map((entity) => this.buildEntity(entity));
  }
}
