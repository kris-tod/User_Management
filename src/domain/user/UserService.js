import { sequelize } from '../../db/index.js';
import { UserRepository } from './UserRepository.js';
import { NotFoundError, ApiError } from '../../utils/errors.js';
import { USER_NOT_FOUND, INVALID_FRIENDS_IDS } from '../../constants/messages.js';
import FileService from '../services/FileService.js';
import PasswordService from '../services/passwordService.js';

export class UserService {
  constructor(logger) {
    this.logger = logger;
    this.userRepo = new UserRepository();
  }

  async getOne(id) {
    this.logger.log('info', 'getone user');

    const user = await this.userRepo.getOne(id);

    if (!user) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    return user;
  }

  async update(id, data) {
    this.logger.log('info', 'update');
    const {
      username, password, email, friendsList, region
    } = data;

    await sequelize.transaction(async (t) => {
      const options = { transaction: t };
      if (region) {
        await this.updateRegionById(id, region, options);
      }
      if (email) {
        await this.updateEmailById(id, email, options);
      }
      if (username) {
        await this.updateUsernameById(id, username, options);
      }
      if (password) {
        await this.updatePasswordById(id, password, options);
      }
      if (friendsList) {
        await this.updateFriends(id, friendsList, options);
      }
    });

    const attributes = Object.keys(data).filter((attr) => attr !== 'friendsList');
    const result = await this.userRepo.getOneWithAttributes(id, attributes);

    if (friendsList) {
      result.friendsList = friendsList;
    }

    return result;
  }

  async updateRegionById(id, region, options) {
    await this.userRepo.update(id, { region }, options);
  }

  async updatePasswordById(id, password, options) {
    const hash = await PasswordService.hashPassword(password);

    await this.userRepo.update(id, { password: hash }, options);
  }

  async updateUsernameById(id, username, options) {
    const userData = await this.userRepo.getOne(id, options);

    if (!userData) {
      throw new NotFoundError(USER_NOT_FOUND);
    }

    await this.userRepo.update(id, { username }, options);
  }

  async updateEmailById(id, email, options) {
    await this.userRepo.update(id, { email }, options);
  }

  async updateFriends(id, friendsIds, propObj) {
    this.logger.log('info', 'addfriend');

    const users = await this.userRepo.getAllByIds(friendsIds, propObj);

    if (friendsIds.length !== users.length) {
      throw new ApiError(INVALID_FRIENDS_IDS);
    }

    await this.userRepo.updateFriends(id, friendsIds, propObj);
  }

  async updateAvatarById(id, avatar, file) {
    const t = await sequelize.transaction();

    try {
      await this.userRepo.update(id, { avatar });
    }
    catch (err) {
      FileService.deleteFile(file);
      t.rollback();
    }

    return {
      avatar: FileService.getFilePath(file)
    };
  }
}
