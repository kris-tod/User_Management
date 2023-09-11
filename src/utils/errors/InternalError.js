import ServerError from './ServerError.js';

export class InternalError extends ServerError {
  constructor(message) {
    super(500, message);
  }
}
