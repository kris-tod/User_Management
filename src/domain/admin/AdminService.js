import { sequelize } from '../../db/index.js';
import { AdminRepository } from './AdminRepository.js';
import { NotFoundError } from '../../utils/errors.js';
import { USER_NOT_FOUND } from '../../constants/messages.js';
import PasswordService from '../services/passwordService.js';

export class AdminService {
  constructor(logger) {
    this.logger = logger;
    this.adminRepo = new AdminRepository();
  }

  async getOne(id) {
    this.logger.log('info', 'getone user');

    const user = await this.adminRepo.getOne(id);

    if (!user) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    return user;
  }

  async update(id, data) {
    this.logger.log('info', 'update');
    const {
      username, password, email
    } = data;

    await sequelize.transaction(async (t) => {
      const options = { transaction: t };
      if (email) {
        await this.updateEmailById(id, email, options);
      }
      if (username) {
        await this.updateUsernameById(id, username, options);
      }
      if (password) {
        await this.updatePasswordById(id, password, options);
      }
    });

    const attributes = Object.keys(data);
    const result = await this.adminRepo.getOneWithAttributes(id, attributes);

    return result;
  }

  async updateRegionById(id, region, options) {
    await this.adminRepo.update(id, { region }, options);
  }

  async updatePasswordById(id, password, options) {
    const hash = await PasswordService.hashPassword(password);

    await this.adminRepo.update(id, { password: hash }, options);
  }

  async updateUsernameById(id, username, options) {
    const userData = await this.adminRepo.getOne(id, options);

    if (!userData) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    await this.adminRepo.update(id, { username }, options);
  }

  async updateEmailById(id, email, options) {
    await this.adminRepo.update(id, { email }, options);
  }
}
