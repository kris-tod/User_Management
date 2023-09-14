import { Op } from 'sequelize';
import { BaseRepo } from '../../utils/BaseRepo.js';
import { FriendshipRepository } from './FriendshipRepository.js';
import { CarRepository } from '../car/CarRepository.js';
import { User as UserModel, UserCar } from '../../db/index.js';
import { User } from './User.js';

const buildUser = ({
  id,
  username,
  password,
  email = 'default@gmail.com',
  avatar = 'default_avatar.jpg',
  region,
  cars = [],
  friendsList = []
}) => new User(id, username, password, region, friendsList, cars, email, avatar);

export class UserRepository extends BaseRepo {
  constructor() {
    super(UserModel);
    this.friendshipRepo = new FriendshipRepository();
    this.carRepo = new CarRepository();
  }

  async getAll(page = 1, region = '') {
    const options = {};

    if (region) {
      options.where = { region };
    }

    const users = await super.getAll(page, ['username'], options);
    const listOfIds = users.map((user) => user.id);

    const friendships = await this.friendshipRepo.findAllFriendshipsForUsersById(listOfIds);

    const collection = users.map((userData) => {
      const user = buildUser(userData);

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

    const friendships = await this.friendshipRepo
      .findAllFriendshipsForUsersById(usersIds, options);

    const collection = users.map((userData) => {
      const user = buildUser(userData.toJSON());

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

    const user = buildUser(userData);

    const friendships = await this.friendshipRepo.findAllFriendshipsById(user.id, options);
    const friendsUsers = await this.getAllByIds(
      friendships.map((friendship) => friendship.friend_id),
      options
    );
    user.friendsList = friendsUsers;

    const carsData = await UserCar.findAll({
      where: {
        userId: id
      }
    });
    const cars = await this.carRepo.getAllByIds(carsData.map((carData) => carData.carId));
    user.cars = cars;

    return user;
  }

  async getOneByUsername(username) {
    const user = await this.dbClient.findOne({
      where: { username }
    });

    if (!user) {
      return null;
    }

    const friendships = await this.friendshipRepo.findAllFriendshipsById(user.id);
    user.friendsList = friendships.map((friendship) => friendship.toJSON().friend_id);

    const carsData = await UserCar.findAll({
      where: {
        userId: user.id
      }
    });
    const cars = await this.carRepo.getAllByIds(carsData.map((carData) => carData.carId));
    user.cars = cars;

    return buildUser(user);
  }

  async updateFriends(id, friendsIdsData, options = {}) {
    const friendsIds = friendsIdsData.map((friendId) => `${friendId}`);
    const userFriendsIds = (await this.friendshipRepo.findAllFriendshipsById(id, options))
      .map((f) => f.friend_id);

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
