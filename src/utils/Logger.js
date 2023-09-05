import { createLogger, transports } from 'winston';

export class Logger {
  constructor(errorPath, infoPath) {
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

  log(type, message) {
    this.logger[type](message);
  }
}
