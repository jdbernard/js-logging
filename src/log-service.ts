import { LogLevel } from './log-message';
import Logger from './logger';

const ROOT_LOGGER_NAME = 'ROOT';

export class LogService {
  private loggers: { [key: string]: Logger };

  public get ROOT_LOGGER() {
    return this.loggers[ROOT_LOGGER_NAME];
  }

  public constructor() {
    this.loggers = {};
    this.loggers[ROOT_LOGGER_NAME] = new Logger(
      ROOT_LOGGER_NAME,
      undefined,
      LogLevel.ALL
    );
  }

  public getLogger(name: string, threshold?: LogLevel): Logger {
    if (this.loggers[name]) {
      return this.loggers[name];
    }

    let parentLogger: Logger;

    const parentLoggerName = Object.keys(this.loggers)
      .filter((n: string) => name.startsWith(n))
      .reduce(
        (acc: string, cur: string) => (acc.length > cur.length ? acc : cur),
        ''
      );

    if (parentLoggerName) {
      parentLogger = this.loggers[parentLoggerName];
    } else {
      parentLogger = this.ROOT_LOGGER;
    }

    this.loggers[name] = parentLogger.createChildLogger(name, threshold);
    return this.loggers[name];
  }
}

export const logService = new LogService();
export default logService;
