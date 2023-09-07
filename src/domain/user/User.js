import validator from 'validator';

import { BaseEntity } from '../../utils/BaseEntity.js';
import rolesMap, { rolesList } from '../../constants/roles.js';
import {
  EMAIL_NOT_VALID, FRIENDS_LIMIT_REACHED, INVALID_ROLE, USERNAME_NOT_VALID, USERS_NOT_FRIENDS
} from '../../constants/messages.js';

const MAX_FRIENDS_COUNT = 1000;

export class User extends BaseEntity {
  constructor(id, username, password, role, email = 'default@gmail.com', avatar = '') {
    super(id);
    this.setUsername(username);
    this.password = password;
    this.role = role;
    this.friendsList = [];
    this.email = email;
    this.avatar = avatar;
  }

  setUsername(username) {
    if (!username) {
      throw new Error(USERNAME_NOT_VALID);
    }

    this.username = username;
  }

  setRole(role) { // TODO: Implement it in UserService!
    this.role = role;
  }

  setAvatar(avatar) {
    this.avatar = avatar;
  }

  setEmail(email) {
    if (email && !validator.isEmail(email)) {
      throw new Error(EMAIL_NOT_VALID);
    }

    this.email = email;
  }

  addFriend(username) {
    if (this.friendsList.length >= MAX_FRIENDS_COUNT) {
      throw new Error(FRIENDS_LIMIT_REACHED);
    }

    this.friendsList.push(username);
  }

  removeFriend(username) {
    if (!this.friendsList.includes(username)) {
      throw new Error(USERS_NOT_FRIENDS);
    }

    this.friendsList = this.friendsList.filter((friendUsername) => friendUsername !== username);
  }
}
