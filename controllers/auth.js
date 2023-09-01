import { compare } from 'bcrypt';
import { createToken } from '../utils/jwt.js';

import UserService from '../services/UserService.js';
import TokenBlacklistService from '../services/TokenBlacklistService.js';

import { 
    USER_NOT_FOUND,
    PASSWORD_INCORRECT, 
    USER_LOGGED_IN, 
    USER_LOGGED_OUT } from '../utils/messages.js';

import { authCookieName } from '../config/index.js';

export const post = {
    login: async (req, res) => {
        const { username, password } = req.body;

        try {
            const userData = await UserService.getByUsername(username);

            if(!userData) throw {
                status: 404,
                message: USER_NOT_FOUND
            };

            const user = userData.toJSON();

            const match = await compare(password, user.password);

            if(!match) throw {
                status: 400,
                message: PASSWORD_INCORRECT
            };

            const token = createToken({
                id: user.id,
                role: user.role
            });

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
