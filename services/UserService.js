import { User, Friendship } from '../models/db.js';
import PasswordService from './passwordService.js'
import FriendshipService from './FriendshipService.js';
import { Op } from 'sequelize';
import { createToken } from '../utils/jwt.js';

import { USER_NOT_END_USER,
    FRIENDS_LIMIT_REACHED, 
    ALREADY_FRIENDS,
    PASSWORD_INCORRECT,
    USER_NOT_FOUND,
    USERS_NOT_FRIENDS,
    INVALID_ROLE
} from '../constants/messages.js';

import roles from '../constants/roles.js'

const MAX_FRIENDS_COUNT = 1000;

const MAX_PER_PAGE = 5;

class UserService {
    static async getAll(page = 1) {
        if(page <= 0) {
            page = 1;
        }

        const data = await User.findAll({
            order: [['username']],
            limit: MAX_PER_PAGE, offset: MAX_PER_PAGE * (page - 1)
        });

        const users = data.map(rawUser => rawUser.toJSON());
        const listOfUsernames = users.map(user => user.username);

        const friendshipsData = await FriendshipService.findAllFriendshipsForUsers(listOfUsernames);
        const friendships = friendshipsData.map(friendship => friendship.toJSON());

        users.forEach(user => {
            user.role = roles[user.role];
            user.list_of_friends = friendships.filter(friendship => friendship.username == user.username)
                .map(friendship => friendship.friend_username);
        });

        return users;
    }

    static async getById(id) {
        const user = await User.findOne({ where: { id } });

        return user;
    }

    static getByUsername(username) {
        return User.findOne({ where: { username } });

        return user;
    }

    static async getWholeInfoById(id) {
        const userData = await UserService.getById(id);
        const user = userData.toJSON();

        user.role = roles[user.role];
        const data = await FriendshipService.findAllFriendshipsByUsername(user.username);

        const friends = data.map(el => el.toJSON().friend_username);
        user.list_of_friends = friends;

        return user;
    }

    static async addFriend(id, friendUsername) {
        const friendData = await UserService.getByUsername(friendUsername);

        if (!friendData)
            throw {
                status: 404,
                message: USER_NOT_FOUND
            };
        if (friendData.toJSON().role != roles.endUser)
            throw {
                status: 401,
                message: USER_NOT_END_USER
            };

        const userData = await UserService.getById(id);

        if (!userData)
            throw {
                status: 404,
                message: USER_NOT_FOUND
            };

        const user = userData.toJSON();

        const friendship = await FriendshipService.find(user.username, friendUsername);

        if (friendship)
            throw {
                status: 422,
                message: ALREADY_FRIENDS
            };

        const friendships = await FriendshipService.findAllFriendshipsByUsername(user.username);

        if (friendships.length >= MAX_FRIENDS_COUNT)
            throw {
                status: 422,
                message: FRIENDS_LIMIT_REACHED
            };

        await FriendshipService.create(user.username, friendUsername);
    }

    static async removeFriend(id, friendUsername) {
        const friendData = await UserService.getByUsername(friendUsername);

        if (!friendData)
            throw {
                status: 404,
                message: USER_NOT_FOUND
            };
        if (friendData.toJSON().role != roles.endUser)
            throw {
                status: 401,
                message: USER_NOT_END_USER
            };

        const userData = await UserService.getById(id);

        if (!userData)
            throw {
                status: 404,
                message: USER_NOT_FOUND
            };

        const user = userData.toJSON();

        const friendship = await FriendshipService.find(user.username, friendUsername);
        if (!friendship)
            throw {
                status: 422,
                message: USERS_NOT_FRIENDS
            };

        await FriendshipService.deleteOne(user.username, friendUsername);
    }

    static async createUser(username, password, role, email) {
        role = roles[role];

        if(!role)
            throw {
                status: 400,
                message: INVALID_ROLE
            }

        const hash = await PasswordService.hashPassword(password);

        return User.create({
            username,
            email,
            password: hash,
            role
        });
    }

    static async loginUser(username, password) {
        const userData = await UserService.getByUsername(username);

        if (!userData) throw {
            status: 404,
            message: USER_NOT_FOUND
        };

        const user = userData.toJSON();

        const match = await PasswordService.comparePasswords(password, user.password);

        if (!match) throw {
            status: 400,
            message: PASSWORD_INCORRECT
        };

        const token = createToken({
            id: user.id,
            role: user.role
        });

        return {
            user,
            token
        };
    }

    static async updatePasswordById(id, password) {
        const hash = await PasswordService.hashPassword(password);

        return User.update({
            password: hash
        }, {
            where: { id }
        });
    }

    static updateAvatarById(id, avatar) {
        return User.update({ avatar }, { where: { id } });
    }

    static updateUsernameById(id, username) {
        return User.findOne({ where: { id } })
            .then(data => {
                const user = data.toJSON();

                return Promise.all([
                    User.update({ username }, { where: { id } }),
                    Friendship.update({ username }, { where: { username: user.username } }),
                    Friendship.update({ friend_username: username }, { where: { friend_username: user.username } })
                ]);
            });
    }

    static async updateEmailById(id, email) {
        const data = await User.update({ email }, { where: { id } });

        if (!data)
            throw {
                status: 404,
                message: USER_NOT_FOUND
            };
    }

    static async deleteById(id) {
        const data = await UserService.getById(id);

        if (!data) throw {
            status: 404,
            message: USER_NOT_FOUND
        };

        await User.findOne({ where: { id } })
            .then(data => {
                const username = data.toJSON().username;

                return Promise.all([
                    User.destroy({ where: { id } }),
                    Friendship.destroy({
                        where: {
                            [Op.or]: [
                                { username: username },
                                { friend_username: username }
                            ]
                        }
                    })
                ]);
            });
    }
}

export default UserService;
