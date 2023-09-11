import ServerError from './ServerError.js';

export class AuthError extends ServerError {
  constructor(message) {
    super(401, message);
  }
}
