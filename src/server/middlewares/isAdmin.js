import { USER_NOT_ADMIN } from '../../constants/messages.js';
import { roles } from '../../domain/user/User.js';
import { ForbiddenError } from '../../utils/errors.js';

export const isAdmin = (req, res, next) => {
  const { role } = req.user;

  if (role !== roles.admin && role !== roles.superadmin && role !== roles.partnerAdmin) {
    throw new ForbiddenError(USER_NOT_ADMIN);
  }

  next();
};
