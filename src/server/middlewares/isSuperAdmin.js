import { USER_NOT_SUPER_ADMIN } from '../../constants/messages.js';
import { roles } from '../../domain/user/User.js';

export const isSuperAdmin = (req, res, next) => {
  const { role } = req.user;

  if (role !== roles.superadmin) {
    res.status(401).send({
      message: USER_NOT_SUPER_ADMIN
    });

    return;
  }

  next();
};
