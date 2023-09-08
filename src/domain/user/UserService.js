import PasswordService from '../services/passwordService.js';
import ServerError from '../../utils/ServerError.js';

import { createToken } from '../../utils/jwt.js';

import {
  USER_NOT_END_USER,
  FRIENDS_LIMIT_REACHED,
  ALREADY_FRIENDS,
  PASSWORD_INCORRECT,
  USER_NOT_FOUND,
  USERS_NOT_FRIENDS,
  INVALID_ROLE,
  DEFAULT_ERROR_MESSAGE
} from '../../constants/messages.js';

import roles from '../../constants/roles.js';

import { UserRepository } from './UserRepository.js';
import { FriendshipRepository } from '../friendships/FriendshipRepository.js';
import { TokenBlacklistRepository } from '../tokenBlacklist/TokenBlacklistRepository.js';

const MAX_FRIENDS_COUNT = 1000;

export class UserService {
  constructor(logger) {
    this.userRepo = new UserRepository();
    this.friendsRepo = new FriendshipRepository();
    this.tokenBlacklistRepo = new TokenBlacklistRepository();
    this.logger = logger;
  }

  async getAll(pageParam) {
    let page = pageParam || 1;
    if (page <= 0) {
      page = 1;
    }

    const users = await this.userRepo.getAll(page, ['username']);
    const listOfUsernames = users.map((user) => user.toJSON().username);

    const friendshipsData = await this.friendsRepo.findAllFriendshipsForUsers(listOfUsernames);
    const friendships = friendshipsData.map((friendship) => friendship.toJSON());

    const collection = users.map((userData) => {
      const user = userData.toJSON();
      user.role = roles[user.role];

      user.friendsList = friendships
        .filter((friendship) => friendship.username === user.username)
        .map((friendship) => friendship.friend_username);

      return user;
    });

    this.logger.log('info', 'getall users');
    return collection;
  }

  async getOne(id) {
    const userData = await this.userRepo.getOne(id);

    if (!userData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    const user = userData.toJSON();

    user.role = roles[user.role];
    const data = await this.friendsRepo.findAllFriendshipsByUsername(user.username);

    user.friendsList = data.map((el) => el.toJSON().friend_username);

    this.logger.log('info', 'getone user');
    return user;
  }

  async addFriend(id, friendUsername) {
    const friendData = await this.userRepo.getOneByUsername(friendUsername);

    if (!friendData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    const friend = friendData.toJSON();

    if (friend.role !== roles.endUser) {
      throw new ServerError(401, USER_NOT_END_USER);
    }

    const userData = await this.userRepo.getOne(id);

    if (!userData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    const user = userData.toJSON();

    const { username } = user;

    const friendship = await this.friendsRepo.getByUsernames(
      username,
      friendUsername
    );

    if (friendship) {
      throw new ServerError(422, ALREADY_FRIENDS);
    }

    const friendships = await this.friendsRepo.findAllFriendshipsByUsername(username);

    if (friendships.length >= MAX_FRIENDS_COUNT) {
      throw new ServerError(422, FRIENDS_LIMIT_REACHED);
    }

    await this.friendsRepo.create({
      username,
      friend_username: friendUsername
    });

    this.logger.log('info', 'addfriend');
  }

  async removeFriend(id, friendUsername) {
    const friendData = await this.userRepo.getOneByUsername(friendUsername);

    if (!friendData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    const friend = friendData.toJSON();

    if (friend.role !== roles.endUser) {
      throw new ServerError(401, USER_NOT_END_USER);
    }

    const userData = await this.userRepo.getOne(id);

    if (!userData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    const { username } = userData.toJSON();

    const friendship = await this.friendsRepo.getByUsernames(
      username,
      friendUsername
    );

    if (!friendship) {
      throw new ServerError(422, USERS_NOT_FRIENDS);
    }

    await this.friendsRepo.destroyByUsernames(username, friendUsername);
    this.logger.log('info', 'removefriend');
  }

  async create({
    username, password, role, email
  }) {
    let roleParam = role;
    roleParam = roles[role];

    if (!role) {
      throw new ServerError(400, INVALID_ROLE);
    }

    const hash = await PasswordService.hashPassword(password);

    await this.userRepo.create({
      username,
      email,
      password: hash,
      role: roleParam
    });

    this.logger.log('info', 'create user');

    const entity = await this.userRepo.getOneByUsername(username);

    if (!entity) {
      throw new ServerError(500, DEFAULT_ERROR_MESSAGE);
    }

    return entity.toJSON();
  }

  async loginUser(username, password) {
    const userData = await this.userRepo.getOneByUsername(username);

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

    this.logger.log('info', 'login user');
    return {
      user,
      token
    };
  }

  async logout(token) {
    this.logger.log('info', 'logout');
    await this.tokenBlacklistRepo.create({ token });
  }

  async update(id, data) {
    const { username, password, email } = data;

    if (email) {
      await this.updateEmailById(id, email);
    }
    if (username) {
      await this.updateUsernameById(id, username);
    }
    if (password) {
      await this.updatePasswordById(id, password);
    }
    this.logger.log('info', 'update');
    return this.userRepo.getOneWithAttributes(id, Object.keys(data));
  }

  async updatePasswordById(id, password) {
    const hash = await PasswordService.hashPassword(password);

    await this.userRepo.update(id, { password: hash });
  }

  async updateAvatarById(id, avatar) {
    return this.userRepo.update(id, { avatar });
  }

  async updateUsernameById(id, username) {
    const userData = await this.userRepo.getOne(id);

    if (!userData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    const user = userData;

    await this.friendsRepo.updateUsername(user.username, username);
    await this.userRepo.update(id, { username });
  }

  async updateEmailById(id, email) {
    await this.userRepo.update(id, { email });
  }

  async destroy(id) {
    const userData = await this.userRepo.getOne(id);

    if (!userData) {
      throw new ServerError(404, USER_NOT_FOUND);
    }

    const user = userData.toJSON();

    const { username } = user;

    await this.userRepo.destroy(id);
    await this.friendsRepo.destroyFriendshipsWithUsername(username);

    this.logger.log('info', 'delete user');
  }
}
