import { INVALID_APP } from '../../constants/messages.js';
import { ForbiddenError } from '../../utils/errors.js';

export const isFromApp = (app) => (req, res, next) => {
  const { user } = req;

  if (user.app !== app) {
    throw new ForbiddenError(INVALID_APP);
  }

  next();
};
