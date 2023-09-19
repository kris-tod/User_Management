import { BaseRepo } from '../../utils/BaseRepo.js';
import { Region as RegionModel } from '../../db/index.js';
import { NotFoundError } from '../../utils/errors.js';
import { Region } from './Region.js';

const buildRegion = (model) => new Region(parseInt(model.id, 10), model.name);

export class RegionRepository extends BaseRepo {
  constructor() {
    super(RegionModel);
  }

  async getAll(page) {
    const {
      total, data, limit, offset
    } = await super.getAll(page);

    return {
      total, limit, offset, data: data.map((entity) => buildRegion(entity))
    };
  }

  async getOne(id, options = {}) {
    const entity = await super.getOne(id, options);
    if (!entity) {
      throw new NotFoundError('Region not found!');
    }
    const result = buildRegion(entity);
    return result;
  }
}
