import { USER_NOT_ADMIN } from '../../constants/messages.js';
import { roles } from '../../domain/user/User.js';

export const isAdmin = (req, res, next) => {
  const { role } = req.user;

  if (role !== roles.admin && role !== roles.superadmin) {
    res.status(401).send({
      message: USER_NOT_ADMIN
    });

    return;
  }

  next();
};
