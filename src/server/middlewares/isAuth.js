import { verifyToken } from '../../utils/jwt.js';
import { authCookieName } from '../../config/index.js';
import { USER_NOT_LOGGED } from '../../constants/messages.js';

export const isAuth = (req, res, next) => {
  const token = req.cookies[authCookieName];

  if (!token) {
    res.status(401).send({
      message: USER_NOT_LOGGED
    });
    return;
  }

  try {
    const data = verifyToken(token);

    req.user = {};
    req.user.id = data.id;
    req.user.role = data.role;

    next();
  }
  catch (err) {
    res.status(401).send({
      message: USER_NOT_LOGGED
    });
  }
};
