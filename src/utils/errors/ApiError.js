import ServerError from './ServerError.js';

export class ApiError extends ServerError {
  constructor(message) {
    super(400, message);
  }
}
