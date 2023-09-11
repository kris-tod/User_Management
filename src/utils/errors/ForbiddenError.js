import ServerError from './ServerError.js';

export class ForbiddenError extends ServerError {
  constructor(message) {
    super(403, message);
  }
}
