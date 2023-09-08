import { USER_NOT_END_USER } from '../../constants/messages.js';
import { roles } from '../../domain/user/User.js';

export const isEndUser = (req, res, next) => {
  const { role } = req.user;

  if (role !== roles.endUser) {
    res.status(401).send({
      message: USER_NOT_END_USER
    });

    return;
  }

  next();
};
