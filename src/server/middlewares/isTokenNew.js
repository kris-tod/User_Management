import { USER_NOT_LOGGED } from '../../constants/messages.js';
import { authCookieName } from '../../config/index.js';
import TokenBlacklistService from '../../services/TokenBlacklistService.js';

export const isTokenNew = async (req, res, next) => {
  const token = req.cookies[authCookieName];

  if (!token) {
    res.status(401).send({
      message: USER_NOT_LOGGED
    });
    return;
  }

  const data = await TokenBlacklistService.find(token);

  if (!data) {
    next();
    return;
  }

  res.status(401).send({
    message: USER_NOT_LOGGED
  });
};
