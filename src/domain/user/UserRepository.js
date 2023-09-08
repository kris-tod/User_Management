import { BaseRepo } from '../../utils/BaseRepo.js';
import { User as UserModel } from '../models/db.js';

export class UserRepository extends BaseRepo {
  constructor() {
    super(UserModel);
  }

  async getOneByUsername(username) {
    const entity = await this.dbClient.findOne({
      where: { username }
    });

    return entity;
  }

  async getOneWithAttributes(id, attributes) {
    const user = await this.dbClient.findOne({ attributes, where: { id } });

    return user;
  }
}
