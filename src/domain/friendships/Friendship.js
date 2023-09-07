import { USERNAME_NOT_VALID } from '../../constants/messages';

export class Friendship {
  constructor(username, friendUsername) {
    this.setUsername(username);
    this.setFriendUsername(friendUsername);
  }

  setUsername(username) {
    if (!this.isValidUsername(username)) {
      throw new Error(USERNAME_NOT_VALID);
    }

    this.username = username;
  }

  setFriendUsername(username) {
    if (!this.isValidUsername(username)) {
      throw new Error(USERNAME_NOT_VALID);
    }

    this.friendUsername = username;
  }

  static isValidUsername(username) {
    return username.length !== 0;
  }
}
