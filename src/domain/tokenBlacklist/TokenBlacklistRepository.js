import { BaseRepo } from '../../utils/BaseRepo.js';
import { TokenBlacklist } from '../models/db.js';

export class TokenBlacklistRepository extends BaseRepo {
  constructor() {
    super(TokenBlacklist);
  }

  async getOne(token) {
    const entity = await this.dbClient.findOne({ where: { token } });

    return entity;
  }
}
