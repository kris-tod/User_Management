import validator from 'validator';
import {
  EMAIL_NOT_VALID,
  FRIENDS_LIMIT_REACHED,
  USERNAME_NOT_VALID,
  USERS_NOT_FRIENDS
} from '../../constants/messages.js';

export const MAX_FRIENDS_COUNT = 1000;

export const rolesList = ['admin', 'endUser', 'superadmin', 'driver', 'partneradmin', 'organizationadmin'];

export const roles = {
  admin: 'admin',
  endUser: 'endUser',
  superadmin: 'superadmin',
  partnerAdmin: 'partneradmin',
  driver: 'driver',
  organizationAdmin: 'organizationadmin'
};

export class User {
  constructor(
    id,
    username,
    password,
    region,
    favouritePartners = [],
    friendsList = [],
    cars = [],
    email = 'default@gmail.com',
    avatar = 'default_avatar.jpg'
  ) {
    this.id = id;
    this.setUsername(username);
    this.password = password;
    this.email = email;
    this.avatar = avatar;
    this.region = region;
    this.friendsList = friendsList;
    this.cars = cars;
    this.favouritePartners = favouritePartners;
  }

  setUsername(username) {
    if (!username) {
      throw new Error(USERNAME_NOT_VALID);
    }

    this.username = username;
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

    this.friendsList = this.friendsList.filter(
      (friendUsername) => friendUsername !== username
    );
  }

  hasReachedFriendsLimit() {
    return this.friendsList.length >= MAX_FRIENDS_COUNT;
  }
}
