import { USER_NOT_DRIVER } from '../../constants/messages.js';
import { roles } from '../../domain/user/User.js';
import { ForbiddenError } from '../../utils/errors.js';

export const isDriver = (req, res, next) => {
  const { role } = req.user;

  if (role !== roles.driver) {
    throw new ForbiddenError(USER_NOT_DRIVER);
  }

  next();
};
