import { Op } from 'sequelize';
import { BaseRepo, MAX_PER_PAGE } from '../../utils/BaseRepo.js';
import { FriendshipRepository } from './FriendshipRepository.js';
import { CarRepository } from '../car/CarRepository.js';
import {
  User as UserModel, UserCar, UserPartner, Region
} from '../../db/index.js';
import { User } from './User.js';
import { PartnerRepository } from '../organizations/partners/PartnerRepository.js';
import { RegionRepository } from '../region/RegionRepository.js';

export class UserRepository extends BaseRepo {
  constructor() {
    super(UserModel);
    this.friendshipRepo = new FriendshipRepository();
    this.carRepo = new CarRepository();
    this.partnerRepo = new PartnerRepository();
    this.regionRepo = new RegionRepository();
  }

  buildEntity({
    id,
    username,
    password,
    email = 'default@gmail.com',
    avatar = 'default_avatar.jpg',
    region,
    favouritePartners = [],
    cars = [],
    friendsList = []
  }) {
    return new User(
      parseInt(id, 10),
      username,
      password,
      region,
      favouritePartners,
      friendsList,
      cars,
      email,
      avatar
    );
  }

  async getAll(page = 1, region = '', order = ['id'], entitiesPerPage = MAX_PER_PAGE) {
    const options = {};

    if (region) {
      options.where = { regionId: region };
    }

    const {
      total,
      rows: users
    } = await this.dbClient.findAndCountAll({
      include: [Region],
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      order
    });
    const listOfIds = users.map((user) => user.id);

    const friendships = await this.friendshipRepo.findAllFriendshipsForUsersById(listOfIds);

    const collection = await Promise.all(
      users.map(async (userData) => {
        const user = this.buildEntity(userData);

        user.friendsList = friendships
          .filter((friendship) => friendship.user_id === user.id)
          .map((friendship) => friendship.friend_id);

        const favouritePartnersIds = (
          await UserPartner.findAll({
            where: {
              userId: user.id
            }
          })
        ).map((entity) => entity.partnerId);

        user.favouritePartners = await this.partnerRepo.getAllByIds(
          1,
          favouritePartnersIds
        );

        return user;
      })
    );

    return {
      total,
      data: collection,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
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

    const friendships = await this.friendshipRepo.findAllFriendshipsForUsersById(
      usersIds,
      options
    );

    const collection = await Promise.all(
      users.map(async (userData) => {
        const user = this.buildEntity(userData.toJSON());

        user.friendsList = friendships
          .filter((friendship) => friendship.user_id === user.id)
          .map((friendship) => friendship.friend_id);

        const favouritePartnersIds = (
          await UserPartner.findAll({
            where: {
              userId: user.id
            }
          })
        ).map((entity) => entity.partnerId);

        user.favouritePartners = await this.partnerRepo.getAllByIds(
          1,
          favouritePartnersIds
        );

        if (userData.regionId) {
          user.region = await this.regionRepo.getOne(userData.regionId);
        }

        return user;
      })
    );

    return collection;
  }

  async getOne(id, options = {}) {
    const userData = await this.dbClient.findOne({
      include: [Region],
      where: { id },
      ...options
    });

    if (!userData) {
      return null;
    }

    const user = this.buildEntity(userData);

    const friendships = await this.friendshipRepo.findAllFriendshipsById(
      user.id,
      options
    );
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
    const cars = await this.carRepo.getAllByIds(
      carsData.map((carData) => carData.carId)
    );
    user.cars = cars;

    const favouritePartnersIds = (
      await UserPartner.findAll({
        where: {
          userId: user.id
        }
      })
    ).map((entity) => entity.partnerId);

    user.favouritePartners = await this.partnerRepo.getAllByIds(
      1,
      favouritePartnersIds
    );

    return user;
  }

  async getOneByUsername(username) {
    const user = await this.dbClient.findOne({
      include: [Region],
      where: { username }
    });

    if (!user) {
      return null;
    }

    const friendships = await this.friendshipRepo.findAllFriendshipsById(
      user.id
    );
    user.friendsList = friendships.map(
      (friendship) => friendship.toJSON().friend_id
    );

    const carsData = await UserCar.findAll({
      where: {
        userId: user.id
      }
    });
    const cars = await this.carRepo.getAllByIds(
      carsData.map((carData) => carData.carId)
    );
    user.cars = cars;

    const favouritePartnersIds = (
      await UserPartner.findAll({
        where: {
          userId: user.id
        }
      })
    ).map((entity) => entity.partnerId);

    user.favouritePartners = await this.partnerRepo.getAllByIds(
      1,
      favouritePartnersIds
    );

    return this.buildEntity(user);
  }

  async updateFavouritePartners(id, favouritePartnersIds) {
    await UserPartner.destroy({
      where: {
        userId: id
      }
    });

    await Promise.all(
      favouritePartnersIds.map(async (partnerId) => {
        await UserPartner.create({
          userId: id,
          partnerId
        });
      })
    );

    return this.getOne(id);
  }

  async updateFriends(id, friendsIdsData, options = {}) {
    const friendsIds = friendsIdsData.map((friendId) => `${friendId}`);
    const userFriendsIds = (
      await this.friendshipRepo.findAllFriendshipsById(id, options)
    ).map((f) => f.friend_id);

    const idsToAdd = friendsIds.filter(
      (friendId) => !userFriendsIds.includes(friendId)
    );
    const idsToRemove = userFriendsIds.filter(
      (friendId) => !friendsIds.includes(friendId)
    );

    idsToAdd.forEach(async (friendId) => {
      await this.friendshipRepo.create(
        { user_id: id, friend_id: friendId },
        options
      );
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
