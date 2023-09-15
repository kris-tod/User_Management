import { Op } from 'sequelize';
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

  async getAllByIds(listOfIds) {
    const collection = await this.dbClient.findAll({
      where: {
        id: {
          [Op.in]: listOfIds
        }
      }
    });

    return collection.map((entity) => buildAdmin(entity));
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
