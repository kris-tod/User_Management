import { verifyToken } from '../../utils/jwt.js';
import { authCookieName } from '../../config/index.js';
import { USER_NOT_LOGGED } from '../../constants/messages.js';
import { AuthError } from '../../utils/errors.js';

export const isAuth = (req, res, next) => {
  const token = req.cookies[authCookieName];

  if (!token) {
    throw new AuthError(USER_NOT_LOGGED);
  }

  try {
    const data = verifyToken(token);

    req.user = data;
    next();
  }
  catch (err) {
    throw new AuthError(USER_NOT_LOGGED);
  }
};
