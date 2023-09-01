import UserService from '../services/UserService.js';
import TokenBlacklistService from '../services/TokenBlacklistService.js';

import {
    USER_LOGGED_IN, 
    USER_LOGGED_OUT 
} from '../constants/messages.js';

import { authCookieName } from '../config/index.js';

export const post = {
    login: async (req, res, next) => {
        const { username, password } = req.body;

        try {
            const { user, token } = await UserService.loginUser(username, password);

            res.cookie(authCookieName, token).status(200).json({
                message: USER_LOGGED_IN
            });
        }
        catch(err) {
            next(err);
        }
    },
    logout: async (req, res, next) => {
        const token = req.cookies[authCookieName];

        try {
            await TokenBlacklistService.addToken(token);

            res.clearCookie(authCookieName).status(200).json({
                message: USER_LOGGED_OUT
            });
        }
        catch(err) {
            next(err);
        }
    }
};
