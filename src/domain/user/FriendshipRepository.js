import { Op } from 'sequelize';
import { BaseRepo } from '../../utils/BaseRepo.js';
import { Friendship } from '../../db/index.js';

export class FriendshipRepository extends BaseRepo {
  constructor() {
    super(Friendship);
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

  async destroyByIds(userId, friendId) {
    await this.dbClient.destroy({
      where: {
        user_id: userId,
        friend_id: friendId
      }
    });
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

  async destroyFriendshipsWithId(id) {
    await this.dbClient.destroy({
      where: {
        [Op.or]: [{ user_id: id }, { friend_id: id }]
      }
    });
  }
}
