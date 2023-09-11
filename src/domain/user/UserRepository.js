import { Op } from 'sequelize';
import { BaseRepo } from '../../utils/BaseRepo.js';
import { FriendshipRepository } from '../friendships/FriendshipRepository.js';
import { User as UserModel } from '../../models/db.js';
import { User } from './User.js';

export class UserRepository extends BaseRepo {
  constructor() {
    super(UserModel);
    this.friendshipRepo = new FriendshipRepository();
  }

  async getAll(page = 1) {
    const users = await super.getAll(page, ['username']);
    const listOfIds = users.map((user) => user.toJSON().id);

    const friendshipsData = await this.friendshipRepo.findAllFriendshipsForUsersById(listOfIds);
    const friendships = friendshipsData.map((friendship) => friendship.toJSON());

    const collection = users.map((userData) => {
      const user = User.createUser(userData.toJSON());

      user.friendsList = friendships
        .filter((friendship) => friendship.user_id === user.id)
        .map((friendship) => friendship.friend_id);

      return user;
    });

    return collection;
  }

  async getAllByIds(usersIds) {
    const users = await this.dbClient.findAll({
      where: {
        id: {
          [Op.in]: usersIds
        }
      }
    });

    const friendshipsData = await this.friendshipRepo.findAllFriendshipsForUsersById(usersIds);
    const friendships = friendshipsData.map((friendship) => friendship.toJSON());

    const collection = users.map((userData) => {
      const user = User.createUser(userData.toJSON());

      user.friendsList = friendships
        .filter((friendship) => friendship.user_id === user.id)
        .map((friendship) => friendship.friend_id);

      return user;
    });

    return collection;
  }

  async getOne(id) {
    const userData = await this.dbClient.findOne({
      where: { id }
    });

    if (!userData) {
      return null;
    }

    const user = User.createUser(userData.toJSON());

    const friendships = await this.friendshipRepo.findAllFriendshipsById(user.id);
    user.friendsList = friendships.map((friendship) => friendship.toJSON().friend_id);

    return user;
  }

  async getOneByUsername(username) {
    const userData = await this.dbClient.findOne({
      where: { username }
    });

    if (!userData) {
      return null;
    }

    const user = userData.toJSON();

    const friendships = await this.friendshipRepo.findAllFriendshipsById(user.id);
    user.friendsList = friendships.map((friendship) => friendship.toJSON().friend_id);

    return user;
  }

  async getOneWithAttributes(id, attributes) {
    const user = await this.dbClient.findOne({ attributes, where: { id } });

    return user;
  }

  async updateFriends(id, friendsIds) {
    this.friendshipRepo.deleteUserFriendshipsById(id);

    friendsIds.forEach(async (friendId) => {
      await this.friendshipRepo.create({ user_id: id, friend_id: friendId });
    });
  }

  async destroy(id) {
    await super.destroy(id);
    await this.friendshipRepo.deleteUserFriendshipsAssociations(id);
  }
}
