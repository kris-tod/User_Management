import { USER_NOT_LOGGED } from '../../constants/messages.js';
import { authCookieName } from '../../config/index.js';
import { TokenBlacklistRepository } from '../../domain/tokenBlacklist/TokenBlacklistRepository.js';

export const isTokenNew = async (req, res, next) => {
  const token = req.cookies[authCookieName];

  if (!token) {
    res.status(401).send({
      message: USER_NOT_LOGGED
    });
    return;
  }

  const tokenRepo = new TokenBlacklistRepository();

  const data = await tokenRepo.getOne(token);

  if (!data) {
    next();
    return;
  }

  res.status(401).send({
    message: USER_NOT_LOGGED
  });
};
