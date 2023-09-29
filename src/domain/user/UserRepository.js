import { Op } from 'sequelize';
import { BaseRepo, MAX_PER_PAGE } from '../../utils/BaseRepo.js';
import { FriendshipRepository } from './FriendshipRepository.js';
import { CarRepository } from '../car/CarRepository.js';
import {
  User as UserModel, UserPartner, Region, Car, Tire, Partner, UserCar
} from '../../db/index.js';
import { User } from './User.js';
import { PartnerRepository } from '../partners/PartnerRepository.js';
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
      id,
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
      count,
      rows: users
    } = await this.dbClient.findAndCountAll({
      include: [
        Region,
        { model: UserModel, as: 'friendsList' },
        { model: Car, include: Tire },
        { model: Partner, as: 'favouritePartners' }
      ],
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      order,
      ...options
    });

    return {
      total: count,
      data: users.map((entity) => this.buildEntity(entity)),
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async getAllByIds(usersIds, options = {}) {
    const users = await this.dbClient.findAll({
      include: [
        Region,
        { model: UserModel, as: 'friendsList' },
        { model: Car, include: Tire },
        { model: Partner, as: 'favouritePartners' }
      ],
      where: {
        id: {
          [Op.in]: usersIds
        }
      },
      ...options
    });

    return users.map((entity) => this.buildEntity(entity));
  }

  async getOne(id, options = {}) {
    const entity = await this.dbClient.findByPk(id, {
      include: [
        Region,
        { model: UserModel, as: 'friendsList' },
        { model: Car, include: Tire },
        { model: Partner, as: 'favouritePartners' }
      ],
      ...options
    });

    if (!entity) {
      return null;
    }
    return this.buildEntity(entity);
  }

  async getOneByCar(carId, options = {}) {
    const userCarData = await UserCar.findOne({
      where: {
        carId
      },
      ...options
    });

    if (!userCarData) {
      return null;
    }

    return this.getOne(userCarData.userId);
  }

  async getOneByUsername(username) {
    const user = await this.dbClient.findOne({
      include: [
        Region,
        { model: UserModel, as: 'friendsList' },
        { model: Car, include: Tire },
        { model: Partner, as: 'favouritePartners' }
      ],
      where: { username }
    });

    if (!user) {
      return null;
    }

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

  async updateFriends(id, friendsIds, options = {}) {
    const userFriendsIds = (
      await this.friendshipRepo.findAllFriendshipsById(id, options)
    ).map((f) => f.friend_id);

    const idsToAdd = friendsIds.filter(
      (friendId) => !userFriendsIds.includes(friendId)
    );
    const idsToRemove = userFriendsIds.filter(
      (friendId) => !friendsIds.includes(friendId)
    );

    await this.friendshipRepo.addFriendships(idsToAdd.map((friendId) => ({
      user_id: id,
      friend_id: friendId
    })), options);

    await this.friendshipRepo.destroyUserFriendshipsByIds(id, idsToRemove, options);

    idsToRemove.forEach(async (friendId) => {
      await this.friendshipRepo.destroyByIds(id, friendId, options);
    });
  }

  async destroy(id) {
    await this.friendshipRepo.deleteUserFriendshipsAssociations(id);
    await super.destroy(id);
  }
}
