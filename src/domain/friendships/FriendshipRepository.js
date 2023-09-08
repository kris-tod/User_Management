import { Op } from 'sequelize';
import { BaseRepo } from '../../utils/BaseRepo.js';
import { Friendship } from '../models/db.js';

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

  async deleteAllUserFriendships(username) {
    await this.dbClient.destroy({
      where: {
        [Op.or]: [{ username }, { friend_username: username }]
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

  async destroyByUsernames(username, friendUsername) {
    await this.dbClient.destroy({
      where: {
        username,
        friend_username: friendUsername
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
}
