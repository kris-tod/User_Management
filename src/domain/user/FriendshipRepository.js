import { Op } from 'sequelize';
import { BaseRepo } from '../../utils/BaseRepo.js';
import { Friendship } from '../../db/index.js';

export class FriendshipRepository extends BaseRepo {
  constructor() {
    super(Friendship);
  }

  async findAllFriendshipsByUsername(username) {
    const collection = await this.dbClient.findAll({
      where: {
        username
      }
    });

    return collection;
  }

  async addFriendships(friendships, options = {}) {
    return this.dbClient.bulkCreate(friendships, options);
  }

  async destroyUserFriendshipsByIds(id, friendshipsIds, options = {}) {
    return this.dbClient.destroy({
      where: {
        user_id: id,
        friend_id: {
          [Op.in]: friendshipsIds
        }
      },
      ...options
    });
  }

  async findAllFriendshipsById(userId, options = {}) {
    const collection = await this.dbClient.findAll({
      where: {
        user_id: userId
      },
      ...options
    });

    return collection;
  }

  async deleteAllUserFriendships(username) {
    await this.dbClient.destroy({
      where: {
        [Op.or]: [{ username }, { friend_username: username }]
      }
    });
  }

  async deleteUserFriendshipsById(id) {
    await this.dbClient.destroy({
      where: { user_id: id }
    });
  }

  async deleteUserFriendshipsAssociations(id) {
    await this.dbClient.destroy({
      where: {
        [Op.or]: [{ user_id: id }, { friend_id: id }]
      }
    });
  }

  async findAllFriendshipsForUsers(listOfUsernames) {
    const collection = await this.dbClient.findAll({
      where: {
        username: {
          [Op.in]: listOfUsernames
        }
      }
    });

    return collection;
  }

  async findAllFriendshipsForUsersById(listOfIds, options = {}) {
    const collection = await this.dbClient.findAll({
      where: {
        user_id: {
          [Op.in]: listOfIds
        }
      },
      ...options
    });
    return collection;
  }

  async destroyByUsernames(username, friendUsername) {
    await this.dbClient.destroy({
      where: {
        username,
        friend_username: friendUsername
      }
    });
  }

  async destroyByIds(userId, friendId) {
    await this.dbClient.destroy({
      where: {
        user_id: userId,
        friend_id: friendId
      }
    });
  }

  async getByUsernames(username, friendUsername) {
    const entity = await this.dbClient.findOne({
      where: {
        username,
        friend_username: friendUsername
      }
    });

    return entity;
  }

  async getByIds(userId, friendId) {
    const entity = await this.dbClient.findOne({
      where: {
        user_id: userId,
        friend_id: friendId
      }
    });

    return entity;
  }

  async updateUsername(oldUsername, username) {
    await this.dbClient.update({ username }, { where: { username: oldUsername } });
    await this.dbClient.update(
      { friend_username: username },
      { where: { friend_username: oldUsername } }
    );
  }

  async destroyFriendshipsWithUsername(username) {
    await this.dbClient.destroy({
      where: {
        [Op.or]: [{ username }, { friend_username: username }]
      }
    });
  }

  async destroyFriendshipsWithId(id) {
    await this.dbClient.destroy({
      where: {
        [Op.or]: [{ user_id: id }, { friend_id: id }]
      }
    });
  }
}
