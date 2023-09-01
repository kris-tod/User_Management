import { USER_NOT_LOGGED } from '../utils/messages.js';
import { authCookieName } from '../config/index.js';
import TokenBlacklistService from '../services/TokenBlacklistService.js';

export default async (req, res, next) => {
    const token = req.cookies[authCookieName];

    if(!token) {
        res.status(401).send({
            message: USER_NOT_LOGGED
        });
        return;
    }

    try {
        const data = await TokenBlacklistService.find(token);
        if(!data) next();
        else {
            res.status(401).send({
                message: USER_NOT_LOGGED
            });
        }
    }
    catch(err) {
        res.status(500).send(err);
    }
}
