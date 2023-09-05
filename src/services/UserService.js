import { Op } from 'sequelize';
import { User, Friendship } from '../models/db.js';
import PasswordService from './passwordService.js';
import FriendshipService from './FriendshipService.js';
import ServerError from '../utils/serverError.js';

import { createToken } from '../utils/jwt.js';

import {
  USER_NOT_END_USER,
  FRIENDS_LIMIT_REACHED,
  ALREADY_FRIENDS,
  PASSWORD_INCORRECT,
  USER_NOT_FOUND,
  USERS_NOT_FRIENDS,
  INVALID_ROLE
} from '../constants/messages.js';

import roles from '../constants/roles.js';
import TokenBlacklistService from './TokenBlacklistService.js';

const MAX_FRIENDS_COUNT = 1000;

const MAX_PER_PAGE = 5;

export class UserService {
  static async getAll(pageParam, userDataObj) {
    let page = pageParam || 1;
    if (page <= 0) {
      page = 1;
    }

    const data = await User.findAll({
      order: [['username']],
      limit: MAX_PER_PAGE,
      offset: MAX_PER_PAGE * (page - 1)
    });

    const users = data.map((rawUser) => rawUser.toJSON());
    const listOfUsernames = users.map((user) => user.username);

    const friendshipsData = await FriendshipService.findAllFriendshipsForUsers(
      listOfUsernames
    );
    const friendships = friendshipsData.map((friendship) => friendship.toJSON());

    users.forEach((userData) => {
      const user = userData;
      user.role = roles[user.role];
      user.list_of_friends = friendships
        .filter((friendship) => friendship.username === user.username)
        .map((friendship) => friendship.friend_username);
    });

    return users;
  }

  static async findOne(id) {
    const user = await User.findOne({ where: { id } });

    return user;
  }

  static getByUsername(username) {
    return User.findOne({ where: { username } });
  }

  static async getOne(id, userDataObj) {
    const userData = await UserService.findOne(id);
    const user = userData.toJSON();

    user.role = roles[user.role];
    const data = await FriendshipService.findAllFriendshipsByUsername(
      user.username
    );

    const friends = data.map((el) => el.toJSON().friend_username);
    user.list_of_friends = friends;

    return user;
  }

  static async addFriend(id, friendUsername, userDataObj) {
    const friendData = await UserService.getByUsername(friendUsername);

    if (!friendData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }
    if (friendData.toJSON().role !== roles.endUser) {
      throw new ServerError(401, USER_NOT_END_USER);
    }

    const userData = await UserService.findOne(id);

    if (!userData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    const user = userData.toJSON();

    const friendship = await FriendshipService.find(
      user.username,
      friendUsername
    );

    if (friendship) {
      throw new ServerError(422, ALREADY_FRIENDS);
    }

    const friendships = await FriendshipService.findAllFriendshipsByUsername(
      user.username
    );

    if (friendships.length >= MAX_FRIENDS_COUNT) {
      throw new ServerError(422, FRIENDS_LIMIT_REACHED);
    }

    await FriendshipService.create(user.username, friendUsername);
  }

  static async removeFriend(id, friendUsername, userDataObj) {
    const friendData = await UserService.getByUsername(friendUsername);

    if (!friendData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }
    if (friendData.toJSON().role !== roles.endUser) {
      throw new ServerError(401, USER_NOT_END_USER);
    }

    const userData = await UserService.findOne(id);

    if (!userData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    const user = userData.toJSON();

    const friendship = await FriendshipService.find(
      user.username,
      friendUsername
    );
    if (!friendship) {
      throw new ServerError(422, USERS_NOT_FRIENDS);
    }

    await FriendshipService.deleteOne(user.username, friendUsername);
  }

  static async create({
    username, password, role, email
  }) {
    let roleParam = role;
    roleParam = roles[role];

    if (!role) {
      throw new ServerError(400, INVALID_ROLE);
    }

    const hash = await PasswordService.hashPassword(password);

    return User.create({
      username,
      email,
      password: hash,
      role: roleParam
    });
  }

  static async loginUser(username, password) {
    const userData = await UserService.getByUsername(username);

    if (!userData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    const user = userData.toJSON();

    const match = await PasswordService.comparePasswords(
      password,
      user.password
    );

    if (!match) {
      throw new ServerError(400, PASSWORD_INCORRECT);
    }

    const token = createToken({
      id: user.id,
      role: user.role
    });

    return {
      user,
      token
    };
  }

  static async logout(token) {
    return TokenBlacklistService.addToken(token);
  }

  static async update(id, data, userDataObj) {
    const { username, password, email } = data;
    if (email) {
      await UserService.updateEmailById(id, email);
    }
    if (username) {
      await UserService.updateUsernameById(id, username);
    }
    if (password) {
      await UserService.updatePasswordById(id, password);
    }

    return User.findOne({ attributes: Object.keys(data), where: { id } });
  }

  static async updatePasswordById(id, password) {
    const hash = await PasswordService.hashPassword(password);

    return User.update(
      {
        password: hash
      },
      {
        where: { id }
      }
    );
  }

  static updateAvatarById(id, avatar) {
    return User.update({ avatar }, { where: { id } });
  }

  static updateUsernameById(id, username) {
    return User.findOne({ where: { id } }).then((data) => {
      const user = data.toJSON();

      return Promise.all([
        User.update({ username }, { where: { id } }),
        Friendship.update({ username }, { where: { username: user.username } }),
        Friendship.update(
          { friend_username: username },
          { where: { friend_username: user.username } }
        )
      ]);
    });
  }

  static async updateEmailById(id, email) {
    const data = await User.update({ email }, { where: { id } });

    if (!data) {
      throw new ServerError(404, USER_NOT_FOUND);
    }
  }

  static async destroy(id, userDataObj) {
    const data = await UserService.findOne(id);

    if (!data) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    await User.findOne({ where: { id } }).then((user) => {
      const { username } = user.toJSON();

      return Promise.all([
        User.destroy({ where: { id } }),
        Friendship.destroy({
          where: {
            [Op.or]: [{ username }, { friend_username: username }]
          }
        })
      ]);
    });
  }
}
