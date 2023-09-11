import {
  BAD_REQUEST_STATUS_CODE,
  FORBIDDEN_STATUS_CODE,
  NOT_FOUND_STATUS_CODE,
  UNAUTHORIZED_STATUS_CODE,
  INTERNAL_ERROR_STATUS_CODE
} from '../server/middlewares/errorHandler.js';

class ServerError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export class ApiError extends ServerError {
  constructor(message) {
    super(BAD_REQUEST_STATUS_CODE, message);
  }
}

export class AuthError extends ServerError {
  constructor(message) {
    super(UNAUTHORIZED_STATUS_CODE, message);
  }
}

export class ForbiddenError extends ServerError {
  constructor(message) {
    super(FORBIDDEN_STATUS_CODE, message);
  }
}

export class InternalError extends ServerError {
  constructor(message) {
    super(INTERNAL_ERROR_STATUS_CODE, message);
  }
}

export class NotFoundError extends ServerError {
  constructor(message) {
    super(NOT_FOUND_STATUS_CODE, message);
  }
}
