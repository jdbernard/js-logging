import { LogMessage, LogLevel } from './log-message';
import LogAppender from './log-appender';

export type DeferredMsg = () => string | object;
export type MessageType = string | DeferredMsg | object;

export class Logger {
  public appenders: LogAppender[] = [];

  public constructor(
    public readonly name: string,
    private parentLogger?: Logger,
    public threshold?: LogLevel
  ) {}

  public createChildLogger(name: string, threshold?: LogLevel): Logger {
    return new Logger(name, this, threshold);
  }

  public doLog(
    level: LogLevel,
    message: Error | MessageType,
    stacktrace?: string
  ): void {
    if (level < this.getEffectiveThreshold()) {
      return;
    }

    const logMsg: LogMessage = {
      scope: this.name,
      level,
      message: '',
      stacktrace: '',
      timestamp: new Date()
    };

    if (message === undefined || message === null) {
      logMsg.message = message;
      logMsg.stacktrace = stacktrace == null ? '' : stacktrace;
    } else if ((message as DeferredMsg).call !== undefined) {
      logMsg.message = (message as DeferredMsg)();
      logMsg.stacktrace = stacktrace == null ? '' : stacktrace;
    } else if (message instanceof Error) {
      const error = message as Error;
      logMsg.error = error;
      logMsg.message = `${error.name}: ${error.message}`;
      logMsg.stacktrace = error.stack == null ? '' : error.stack;
    } else {
      // string | object
      logMsg.message = message;
      logMsg.stacktrace = stacktrace == null ? '' : stacktrace;
    }

    this.sendToAppenders(logMsg);
  }

  public trace(message: Error | MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.TRACE, message, stacktrace);
  }

  public debug(message: Error | MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.DEBUG, message, stacktrace);
  }

  public log(message: MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.LOG, message, stacktrace);
  }

  public info(message: MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.INFO, message, stacktrace);
  }

  public warn(message: MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.WARN, message, stacktrace);
  }

  public error(message: Error | MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.ERROR, message, stacktrace);
  }

  public fatal(message: Error | MessageType, stacktrace?: string): void {
    this.doLog(LogLevel.FATAL, message, stacktrace);
  }

  protected sendToAppenders(logMsg: LogMessage) {
    this.appenders.forEach(app => {
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
