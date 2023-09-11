import ServerError from './ServerError.js';

export class NotFoundError extends ServerError {
  constructor(message) {
    super(404, message);
  }
}
