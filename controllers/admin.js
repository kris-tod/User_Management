import UserService from '../services/UserService.js';

import {
    USER_CREATED, 
    PASSWORD_UPDATED,
    USER_DELETED 
} from '../constants/messages.js';

import { saltRounds } from '../config/index.js';

export const get = {
    users: async (req, res, next) => {
        const { page } = req.query;

        try {
            const data = await UserService.getAll(page);

            res.status(200).json(data);
        }
        catch (err) {
            next(err);
        }
    }
};

export const post = {
    user: async (req, res, next) => {
        const { username, email, password, role } = req.body;

        try {
            await UserService.createUser(username, password, role, email);

            res.status(200).json({
                message: USER_CREATED
            });
        }
        catch(err) {
            next(err);
        }
    }
};
export const patch = {
    password: async (req, res, next) => {
        const { id } = req.params;
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
    user: async (req, res, next) => {
        const { id } = req.params;

        try {
            await UserService.deleteById(id);

            res.status(200).json({
                message: USER_DELETED
            });
        }
        catch (err) {
            next(err);
        }
    }
};

