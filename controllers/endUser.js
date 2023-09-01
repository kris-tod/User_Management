import UserService from '../services/UserService.js';
import fs from 'fs'

import { genSalt, hash as _hash } from 'bcrypt';
import { saltRounds, domain, staticDirname } from '../config/index.js';

import {
    ADDED_FRIEND,
    USERNAME_UPDATED,
    PASSWORD_UPDATED,
    EMAIL_UPDATED,
    REMOVED_FRIEND,
    AVATAR_ADDED
} from '../utils/messages.js';

export const get = {
    myInfo: async (req, res) => {
        const id = req.userId;

        try {
            const user = await UserService.getWholeInfoById(id);

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
            await UserService.addFriend(id, friendUsername);

            res.status(200).json({
                message: ADDED_FRIEND
            });
        }
        catch (err) {
            res.status(err.status || 500).send(err);
        }
    },
    avatar: async (req, res) => {
        const id = req.userId;
        const filePath = req.filePath;

        try {
            await UserService.updateAvatarById(id, filePath);

            res.status(200).json({
                message: AVATAR_ADDED
            });
        }
        catch(err) {
            fs.unlinkSync(`${staticDirname}/${file.filename}`);
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
            await UserService.updateEmailById(id, email);

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
            await UserService.removeFriend(id, friendUsername);

            res.status(200).json({
                message: REMOVED_FRIEND
            });
        }
        catch (err) {
            res.status(err.status || 500).send(err);
        }
    }
};
