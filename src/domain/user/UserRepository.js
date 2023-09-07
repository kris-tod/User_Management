import { BaseEntityRepository } from '../../utils/BaseEntityRepository.js';
import { User as UserModel } from '../models/db.js';
import { User } from './User.js';

export class UserRepository extends BaseEntityRepository {
  constructor() {
    super(UserModel);
  }

  async getAll(page = 1) {
    const collection = await super.getAll(page);

    return collection.map(({
      id, username, password, email, avatar, role
    }) => new User(id, username, password, role, email, avatar));
  }

  async getOne(id) {
    const entity = await super.getOne(id);

    if (!entity) {
      return null;
    }

    const {
      username, password, email, avatar, role
    } = entity;

    return new User(id, username, password, role, email, avatar);
  }

  async getOneByUsername(username) {
    const entity = await this.dbClient.findOne({
      where: { username }
    });

    if (!entity) {
      return null;
    }

    const {
      id, password, email, avatar, role
    } = entity;

    return new User(id, username, password, role, email, avatar);
  }

  async getOneWithAttributes(id, attributes) {
    const user = await this.dbClient.findOne({ attributes, where: { id } });

    return user && user.toJSON();
  }
}
