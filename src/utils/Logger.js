import { createLogger, transports } from 'winston';

export class Logger {
  constructor(errorPath) {
    this.logger = createLogger({
      transports: [
        new transports.Console({
          level: 'info'
        }),
        new transports.File({
          filename: errorPath,
          level: 'error'
        })
      ]
    });
  }

  log(type, message, data) {
    this.logger[type](message, data);
  }
}
