import { LogLevel, LogMessage } from './log-message';
import { LogAppender } from './log-appender';

export type DeferredMsg = () => string | Record<string, unknown>;
export type MessageType = string | DeferredMsg | Record<string, unknown>;

export function isDeferredMsg(msg: MessageType): msg is DeferredMsg {
  return typeof msg === 'function';
}

/**
 * Logger class for logging messages.
 *
 * Loggers are used to log messages at different levels. The levels are, in
 * order of increasing severity: TRACE, DEBUG, LOG, INFO, WARN, ERROR, FATAL.
 * Log messages can be logged at a specific level by calling the corresponding
 * method on the logger instance. For example, to log a message at the INFO
 * level, call the *info* method on the logger.
 *
 * Loggers have a threshold level, which is the minimum level of log message
 * that will be logged by the logger. Log messages with a level below the
 * threshold will be ignored. The threshold level can be set when creating a
 * logger, or by calling the *setThreshold* method on an existing logger. If a
 * threshold is not set, the logger will use the threshold of its parent
 * logger.
 *
 * Loggers are hierarchical, with the hierarchy defined by the logger name.
 * The heirarchy is tracked by the children: child loggers have a link to their
 * parents, while parent loggers do not have a list of their children.
 *
 * When a log message is logged by a logger, it is sent to all of the appenders
 * attached to the logger and to the parent logger. Appenders can be attached
 * to any Logger instance, but, because of this upwards propogation, appenders
 * are usually attached to the root logger, which is an ancestor of all loggers
 * created by the same LogService instance.
 *
 * Loggers are typically created and managed by a LogService instance.  The
 * *LogService#getLogger* method is used to get a logger by name, creating it
 * if necessary. When creating a new logger, the parent logger is determined by
 * the longest existing logger name that is a prefix of the new logger name.
 * For more details, see *LogService#getLogger*.
 */
export class Logger {
  public appenders: LogAppender[] = [];

  public constructor(
    public readonly name: string,
    private parentLogger?: Logger,
    public threshold?: LogLevel,
  ) {}

  public createChildLogger(name: string, threshold?: LogLevel): Logger {
    return new Logger(name, this, threshold);
  }

  public doLog(
    level: LogLevel,
    msg: Error | MessageType,
    stacktrace?: string,
  ): void {
    if (level < this.getEffectiveThreshold()) {
      return;
    }

    const logMsg: LogMessage = {
      scope: this.name,
      level,
      msg: '',
      stacktrace: '',
      timestamp: new Date(),
    };

    if (msg === undefined || msg === null) {
      logMsg.msg = msg;
      logMsg.stacktrace = stacktrace ?? '';
    } else if (msg instanceof Error) {
      const error = msg as Error;
      logMsg.error = error;
      logMsg.msg = `${error.name}: ${error.message}`;
      logMsg.stacktrace = stacktrace ?? error.stack ?? '';
    } else if (isDeferredMsg(msg)) {
      logMsg.msg = msg();
      logMsg.stacktrace = stacktrace == null ? '' : stacktrace;
    } else {
      // string | object
      logMsg.msg = msg;
      logMsg.stacktrace = stacktrace == null ? '' : stacktrace;
    }

    this.sendToAppenders(logMsg);
  }

  public trace(msg: Error | MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.TRACE, msg, stacktrace);
  }

  public debug(msg: Error | MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.DEBUG, msg, stacktrace);
  }

  public log(msg: MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.LOG, msg, stacktrace);
  }

  public info(msg: MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.INFO, msg, stacktrace);
  }

  public warn(msg: MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.WARN, msg, stacktrace);
  }

  public error(msg: Error | MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.ERROR, msg, stacktrace);
  }

  public fatal(msg: Error | MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.FATAL, msg, stacktrace);
  }

  protected sendToAppenders(logMsg: LogMessage) {
    this.appenders.forEach((app) => {
      app.appendMessage(logMsg);
    });

    if (this.parentLogger) {
      this.parentLogger.sendToAppenders(logMsg);
    }
  }

  protected getEffectiveThreshold(): LogLevel {
    if (this.threshold) {
      return this.threshold;
    }
    if (this.parentLogger) {
      return this.parentLogger.getEffectiveThreshold();
    }

    // should never happen (root logger should always have a threshold
    return LogLevel.ALL;
  }
}

export default Logger;
