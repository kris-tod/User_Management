import UserService from '../services/UserService.js';
import FriendshipService from '../services/FriendshipService.js';

import { 
    PAGE_NOT_PASSED, 
    USER_CREATED, 
    PASSWORD_UPDATED, 
    USER_NOT_FOUND, 
    USER_DELETED } from '../utils/messages.js';

import { genSalt, hash as _hash } from 'bcrypt';
import { saltRounds } from '../config/index.js';

export const get = {
    users: async (req, res) => {
        const { page } = req.query;
        if (!page || page < 0) {
            res.status(400).json({
                message: PAGE_NOT_PASSED
            });
            return;
        }

        try {
            const data = await UserService.getAll(page);
            const users = data.map(rawUser => rawUser.toJSON());
            const listOfUsernames = users.map(user => user.username);

            const friendshipsData = await FriendshipService.findAllFriendshipsForUsers(listOfUsernames);
            const friendships = friendshipsData.map(friendship => friendship.toJSON());

            users.forEach(user => {
                user.list_of_friends = friendships.filter(friendship => friendship.username == user.username)
                    .map(friendship => friendship.friend_username);
            });

            res.status(200).json(users);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }
};
export const post = {
    user: (req, res) => {
        const { username, email, password, role } = req.body;

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
                        await UserService.createUser(username, hash, role, email);

                        res.status(200).json({
                            message: USER_CREATED
                        });
                    }
                    catch (err) {
                        res.status(500).send(err);
                    }
                }
            });
        });
    }
};
export const patch = {
    password: (req, res) => {
        const { id } = req.params;
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
                    catch (err) {
                        res.status(500).json(err);
                    }
                }
            });
        });
    }
};
export const deleteRequests = {
    user: async (req, res) => {
        const { id } = req.params;

        try {
            const data = await UserService.getById(id);

            if (!data) throw {
                status: 404,
                message: USER_NOT_FOUND
            };

            await UserService.deleteById(id);

            res.status(200).json({
                message: USER_DELETED
            });
        }
        catch (err) {
            res.status(err.status || 500).send(err);
        }
    }
};

