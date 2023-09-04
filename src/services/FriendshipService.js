import { Op } from 'sequelize';
import { Friendship } from '../models/db.js';

class FriendshipService {
  static findAllFriendshipsForUsers(listOfUsernames) {
    return Friendship.findAll({
      where: {
        username: {
          [Op.in]: listOfUsernames
        }
      }
    });
  }

  static deleteAllByUsername(username) {
    return Friendship.destroy({
      where: {
        [Op.or]: [{ username }, { friend_username: username }]
      }
    });
  }

  static deleteOne(username, friendUsername) {
    return Friendship.destroy({
      where: {
        username,
        friend_username: friendUsername
      }
    });
  }

  static find(username, friendUsername) {
    return Friendship.findOne({
      where: {
        username,
        friend_username: friendUsername
      }
    });
  }

  static findAllFriendshipsByUsername(username) {
    return Friendship.findAll({
      where: {
        username
      }
    });
  }

  static findAllFriendsUsernames(username) {
    return Friendship.findAll({
      attributes: ['friend_username'],
      where: { username }
    });
  }

  static create(username, friendUsername) {
    return Friendship.create({
      username,
      friend_username: friendUsername
    });
  }
}

export default FriendshipService;
