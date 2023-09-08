import { USER_NOT_LOGGED } from '../../constants/messages.js';
import { authCookieName } from '../../config/index.js';
import TokenBlacklistService from '../../domain/tokenBlacklist/TokenBlacklistService.js';

export const isTokenNew = (logger) => async (req, res, next) => {
  const token = req.cookies[authCookieName];

  if (!token) {
    res.status(401).send({
      message: USER_NOT_LOGGED
    });
    return;
  }

  const tokenService = new TokenBlacklistService(logger);

  const data = await tokenService.find(token);

  if (!data) {
    next();
    return;
  }

  res.status(401).send({
    message: USER_NOT_LOGGED
  });
};
