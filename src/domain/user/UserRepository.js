import { Op } from 'sequelize';
import { BaseRepo } from '../../utils/BaseRepo.js';
import { FriendshipRepository } from './FriendshipRepository.js';
import { User as UserModel } from '../../db/index.js';
import { User } from './User.js';

export class UserRepository extends BaseRepo {
  constructor() {
    super(UserModel);
    this.friendshipRepo = new FriendshipRepository();
  }

  async getAll(page = 1, region = '') {
    const options = {};

    if (region) {
      options.where = { region };
    }

    const users = await super.getAll(page, ['username'], options);
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

  async getAllByIds(usersIds, options = {}) {
    const users = await this.dbClient.findAll({
      where: {
        id: {
          [Op.in]: usersIds
        }
      },
      ...options
    });

    const friendshipsData = await this.friendshipRepo
      .findAllFriendshipsForUsersById(usersIds, options);
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

  async getOne(id, options = {}) {
    const userData = await this.dbClient.findOne({
      where: { id },
      ...options
    });

    if (!userData) {
      return null;
    }

    const user = User.createUser(userData.toJSON());

    const friendships = await this.friendshipRepo.findAllFriendshipsById(user.id, options);
    const friendsUsers = await this.getAllByIds(
      friendships.map((friendship) => friendship.toJSON().friend_id),
      options
    );
    user.friendsList = friendsUsers;

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

    return User.createUser(user);
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

  async updateFriends(id, friendsIdsData, options = {}) {
    const friendsIds = friendsIdsData.map((friendId) => `${friendId}`);
    const userFriendsIds = (await this.friendshipRepo.findAllFriendshipsById(id, options))
      .map((f) => f.toJSON().friend_id);

    const idsToAdd = friendsIds.filter((friendId) => !userFriendsIds.includes(friendId));
    const idsToRemove = userFriendsIds.filter((friendId) => !friendsIds.includes(friendId));

    idsToAdd.forEach(async (friendId) => {
      await this.friendshipRepo.create({ user_id: id, friend_id: friendId }, options);
    });

    idsToRemove.forEach(async (friendId) => {
      await this.friendshipRepo.destroyByIds(id, friendId, options);
    });
  }

  async destroy(id) {
    await this.friendshipRepo.deleteUserFriendshipsAssociations(id);
    await super.destroy(id);
  }
}
