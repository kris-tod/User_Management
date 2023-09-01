import UserService from '../services/UserService.js';
import TokenBlacklistService from '../services/TokenBlacklistService.js';

import {
    USER_LOGGED_IN, 
    USER_LOGGED_OUT 
} from '../utils/messages.js';

import { authCookieName } from '../config/index.js';

export const post = {
    login: async (req, res) => {
        const { username, password } = req.body;

        try {
            const { user, token } = await UserService.loginUser(username, password);

            res.cookie(authCookieName, token).status(200).json({
                message: USER_LOGGED_IN
            });
        }
        catch(err) {
            res.status(err.status || 401).send(err);
        }
    },
    logout: async (req, res) => {
        const token = req.cookies[authCookieName];

        try {
            await TokenBlacklistService.addToken(token);

            res.clearCookie(authCookieName).status(200).json({
                message: USER_LOGGED_OUT
            });
        }
        catch(err) {
            res.status(500).send(err);
        }
    }
};
