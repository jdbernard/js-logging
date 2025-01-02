import { LogLevel } from './log-message';
import { Logger } from './logger';

const ROOT_LOGGER_NAME = 'ROOT';

/**
 * Service for managing loggers. A LogService instance defines
 * the service context for a set of loggers. Typically there is only one
 * LogService instance per application, the one exported as default from this
 * module.
 */
export class LogService {
  private loggers: Record<string, Logger>;

  public get ROOT_LOGGER() {
    return this.loggers[ROOT_LOGGER_NAME];
  }

  public constructor() {
    this.loggers = {};
    this.loggers[ROOT_LOGGER_NAME] = new Logger(
      ROOT_LOGGER_NAME,
      undefined,
      LogLevel.ALL,
    );
  }

  /**
   * Get a logger by name. If the logger does not exist, it will be created.
   * Loggers are hierarchical, with the heirarchy defined by the logger name.
   * When creating a new logger, the parent logger is determined by the longest
   * existing logger name that is a prefix of the new logger name. For example,
   * if a logger with the name "foo" already exists, any subsequent loggers
   * with the names "foo.bar", "foo/bar", "foolish.choice", etc. will be
   * created as children of the "foo" logger.
   *
   * As another example, given the following invocations:
   *
   * ```typescript
   * logService.getLogger('foo');
   * logService.getLogger('foo.bar');
   * logService.getLogger('foo.bar.baz');
   * logService.getLogger('foo.qux');
   * ```
   *
   * will result in the following logging hierarchy:
   *
   *     foo
   *     ├─foo.bar
   *     │ └─foo.bar.baz
   *     └─foo.qux
   *
   * See the Logger class for details on how loggers are used and the
   * implications of the logger hierarchy.
   */
  public getLogger(name: string, threshold?: LogLevel): Logger {
    if (this.loggers[name]) {
      return this.loggers[name];
    }

    let parentLogger: Logger;

    const parentLoggerName = Object.keys(this.loggers)
      .filter((n: string) => name.startsWith(n))
      .reduce(
        (acc: string, cur: string) => (acc.length > cur.length ? acc : cur),
        '',
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
