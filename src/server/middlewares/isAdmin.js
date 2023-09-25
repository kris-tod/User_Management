import { USER_NOT_ADMIN } from '../../constants/messages.js';
import { adminRoles } from '../../domain/admin/Admin.js';
import { ForbiddenError } from '../../utils/errors.js';

export const isAdmin = (req, res, next) => {
  const { role } = req.user;

  if (!adminRoles.includes(role)) {
    throw new ForbiddenError(USER_NOT_ADMIN);
  }

  next();
};
