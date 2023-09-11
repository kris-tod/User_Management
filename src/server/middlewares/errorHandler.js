import {
  DEFAULT_ERROR_MESSAGE,
  URL_NOT_FOUND
} from '../../constants/messages.js';
import {
  AuthError, ForbiddenError, NotFoundError, InternalError, ApiError
} from '../../utils/errors.js';

export const errorHandler = (err, req, res) => {
  const response = err.message
    ? { message: err.message }
    : { message: DEFAULT_ERROR_MESSAGE };

  switch (typeof err) {
    case AuthError:
      response.status = 400;
      break;
    case NotFoundError:
      response.status = 404;
      break;
    case ForbiddenError:
      response.status = 403;
      break;
    case InternalError:
      response.status = 500;
      break;
    case ApiError:
      response.status = 400;
      break;
    default:
      response.status = 500;
  }

  res.status(err.status).send(response);
};

export const urlNotFoundHandler = (req, res) => {
  res.status(404).send({
    message: URL_NOT_FOUND
  });
};
