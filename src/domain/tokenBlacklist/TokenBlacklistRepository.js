import { BaseEntityRepository } from '../../utils/BaseEntityRepository.js';
import { TokenBlacklist } from '../models/db.js';

export class TokenBlacklistRepository extends BaseEntityRepository {
  constructor() {
    super(TokenBlacklist);
  }

  async getOne(token) {
    const entity = await this.dbClient.findOne({ where: { token } });

    return entity && entity.toJSON();
  }
}
