import {
  DEFAULT_ERROR_MESSAGE,
  URL_NOT_FOUND
} from '../../constants/messages.js';

export const errorHandler = (err, req, res) => {
  const response = err.message
    ? { message: err.message }
    : { message: DEFAULT_ERROR_MESSAGE };

  res.status(err.status || 500).send(response);
};

export const urlNotFoundHandler = (req, res) => {
  res.status(404).send({
    message: URL_NOT_FOUND
  });
};

export const FORBIDDEN_STATUS_CODE = 403;
export const BAD_REQUEST_STATUS_CODE = 400;
export const UNAUTHORIZED_STATUS_CODE = 403;
export const INTERNAL_ERROR_STATUS_CODE = 403;
export const NOT_FOUND_STATUS_CODE = 404;
