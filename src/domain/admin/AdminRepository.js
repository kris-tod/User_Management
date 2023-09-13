import { BaseRepo } from '../../utils/BaseRepo.js';
import { Admin as AdminModel } from '../../db/index.js';
import { Admin } from './Admin.js';

export class AdminRepository extends BaseRepo {
  constructor() {
    super(AdminModel);
  }

  async getAll(page = 1, region = '') {
    const options = {};

    if (region) {
      options.where = { region };
    }

    const users = await super.getAll(page, ['username'], options);

    return users.map((user) => Admin.build(user.toJSON()));
  }

  async getOneWithAttributes(id, attributes) {
    if (!attributes.length) {
      return {};
    }

    const userData = await this.dbClient.findOne({ attributes, where: { id } });
    const user = userData.toJSON();
    const result = {};

    attributes.forEach((attr) => {
      result[attr] = user[attr];
    });

    return result;
  }

  async getOneByUsername(username) {
    const userData = await this.dbClient.findOne({
      where: { username }
    });

    if (!userData) {
      return null;
    }

    const user = userData.toJSON();

    return Admin.build(user);
  }
}
