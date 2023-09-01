import UserService from '../services/UserService.js';
import FriendshipService from '../services/FriendshipService.js';
import fs from 'fs'

import { genSalt, hash as _hash } from 'bcrypt';
import { saltRounds, domain, staticDirname } from '../config/index.js';

import {
    USER_NOT_FOUND,
    FRIENDS_LIMIT_REACHED,
    ALREADY_FRIENDS,
    ADDED_FRIEND,
    USERNAME_UPDATED,
    PASSWORD_UPDATED,
    EMAIL_UPDATED,
    USER_NOT_END_USER,
    USERS_NOT_FRIENDS,
    REMOVED_FRIEND,
    FILE_TOO_BIG,
    AVATAR_ADDED,
    FILE_NOT_PROVIDED
} from '../utils/messages.js';

const MAX_FRIENDS_COUNT = 1000;
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export const get = {
    myInfo: async (req, res) => {
        const id = req.userId;

        try {
            const userData = await UserService.getById(id);
            const user = userData.toJSON();

            const data = await FriendshipService.findAllFriendshipsByUsername(user.username);

            const friends = data.map(el => el.toJSON().friend_username);
            user.list_of_friends = friends;
            res.status(200).json(user);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }
};
export const post = {
    addFriend: async (req, res) => {
        const id = req.userId;
        const { friendUsername } = req.body;

        try {
            const friendData = await UserService.getByUsername(friendUsername);

            if (!friendData)
                throw {
                    status: 404,
                    message: USER_NOT_FOUND
                };
            if (friendData.toJSON().role == 0)
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

            res.status(200).json({
                message: ADDED_FRIEND
            });
        }
        catch (err) {
            console.log(err);
            res.status(err.status || 500).send(err);
        }
    },
    avatar: async (req, res) => {
        const id = req.userId;
        const file = req.file;

        if (!file) {
            res.status(400).send({
                message: FILE_NOT_PROVIDED
            });

            return;
        }

        if (file.size > MAX_AVATAR_SIZE) {
            res.status(400).send({
                message: FILE_TOO_BIG
            });

            return;
        }

        const filePath = domain + file.path.split(staticDirname)[1];

        try {
            await UserService.updateAvatarById(id, filePath);

            res.status(200).json({
                message: AVATAR_ADDED
            });
        }
        catch(err) {
            fs.unlinkSync(`uploads/${file.filename}`);
            res.status(500).send(err);
        }
    }
};
export const patch = {
    username: async (req, res) => {
        const id = req.userId;
        const { username } = req.body;

        try {
            await UserService.updateUsernameById(id, username);

            res.status(200).json({
                message: USERNAME_UPDATED
            });
        }
        catch(err) {
            res.status(500).send(err);
        }
    },
    email: async (req, res) => {
        const id = req.userId;
        const { email } = req.body;

        try {
            const data = await UserService.updateEmailById(id, email);

            if (!data)
                throw {
                    status: 404,
                    message: USER_NOT_FOUND
                };

            res.status(200).json({
                message: EMAIL_UPDATED
            });
        }
        catch(err) {
            res.status(err.status || 500).send(err);
        }
    },
    password: (req, res) => {
        const id = req.userId;
        const { password } = req.body;

        genSalt(saltRounds, (err, salt) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            _hash(password, salt, async (err, hash) => {
                if (err) {
                    res.status(500).send(err);
                }
                else {
                    try {
                        await UserService.updatePasswordById(id, hash);

                        res.status(200).json({
                            message: PASSWORD_UPDATED
                        });
                    }
                    catch(err) {
                        res.status(500).json(err);
                    }
                }
            });
        });
    }
};
export const deleteRequests = {
    removeFriend: async (req, res) => {
        const id = req.userId;
        const { friendUsername } = req.body;

        try {
            const friendData = await UserService.getByUsername(friendUsername);

            if (!friendData)
                throw {
                    status: 404,
                    message: USER_NOT_FOUND
                };
            if (friendData.toJSON().role == 0)
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

            res.status(200).json({
                message: REMOVED_FRIEND
            });
        }
        catch (err) {
            res.status(err.status || 500).send(err);
        }
    }
};
