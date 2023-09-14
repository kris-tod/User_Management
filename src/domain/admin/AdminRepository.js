import { BaseRepo } from '../../utils/BaseRepo.js';
import { Admin as AdminModel } from '../../db/index.js';
import { Admin } from './Admin.js';

const buildAdmin = ({
  id,
  username,
  password,
  role = 'admin',
  region = null,
  email = ''
}) => new Admin(id, username, password, role, region, email);

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

    return users.map((user) => buildAdmin(user.toJSON()));
  }

  async getOneByUsername(username) {
    const userData = await this.dbClient.findOne({
      where: { username }
    });

    if (!userData) {
      return null;
    }

    return buildAdmin(userData.toJSON());
  }
}
