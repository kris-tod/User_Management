import UserService from '../services/UserService.js';
import fs from 'fs'

import { staticDirname } from '../config/index.js';

import {
    ADDED_FRIEND,
    USERNAME_UPDATED,
    PASSWORD_UPDATED,
    EMAIL_UPDATED,
    REMOVED_FRIEND,
    AVATAR_ADDED
} from '../constants/messages.js';

export const get = {
    myInfo: async (req, res, next) => {
        const id = req.userId;

        try {
            const user = await UserService.getWholeInfoById(id);

            res.status(200).json(user);
        }
        catch (err) {
            next(err);
        }
    }
};
export const post = {
    addFriend: async (req, res, next) => {
        const id = req.userId;
        const { friendUsername } = req.body;

        try {
            await UserService.addFriend(id, friendUsername);

            res.status(200).json({
                message: ADDED_FRIEND
            });
        }
        catch(err) {
            next(err); 
        }
    },
    avatar: async (req, res, next) => {
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
            next(err);
        }
    }
};
export const patch = {
    username: async (req, res, next) => {
        const id = req.userId;
        const { username } = req.body;

        try {
            await UserService.updateUsernameById(id, username);

            res.status(200).json({
                message: USERNAME_UPDATED
            });
        }
        catch(err) {
            next(err);
        }
    },
    email: async (req, res, next) => {
        const id = req.userId;
        const { email } = req.body;

        try {
            await UserService.updateEmailById(id, email);

            res.status(200).json({
                message: EMAIL_UPDATED
            });
        }
        catch(err) {
            next(err);
        }
    },
    password: async (req, res, next) => {
        const id = req.userId;
        const { password } = req.body;

        try {
            await UserService.updatePasswordById(id, password);

            res.status(200).json({
                message: PASSWORD_UPDATED
            });
        }
        catch(err) {
            next(err);
        }
    }
};
export const deleteRequests = {
    removeFriend: async (req, res, next) => {
        const id = req.userId;
        const { friendUsername } = req.body;

        try {
            await UserService.removeFriend(id, friendUsername);

            res.status(200).json({
                message: REMOVED_FRIEND
            });
        }
        catch (err) {
            next(err);
        }
    }
};
