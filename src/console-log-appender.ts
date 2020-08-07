/*tslint:disable:no-console*/
import { LogMessage, LogLevel } from './log-message';
import LogAppender from './log-appender';

export class ConsoleLogAppender implements LogAppender {
  public threshold = LogLevel.ALL;

  constructor(threshold?: LogLevel) {
    if (threshold) {
      this.threshold = threshold;
    }
  }

  public appendMessage(msg: LogMessage): void {
    if (this.threshold && msg.level < this.threshold) {
      return;
    }

    let logMethod = console.log;
    switch (msg.level) {
      case LogLevel.ALL:
        logMethod = console.log;
        break;
      case LogLevel.TRACE:
        logMethod = console.log;
        break;
      case LogLevel.DEBUG:
        logMethod = console.debug;
        break;
      case LogLevel.LOG:
        logMethod = console.log;
        break;
      case LogLevel.INFO:
        logMethod = console.info;
        break;
      case LogLevel.WARN:
        logMethod = console.warn;
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        logMethod = console.trace;
        break;
    }

    if (msg.error) {
      logMethod(`[${msg.scope}]:`, msg.message, msg.error);
    } else if (msg.stacktrace) {
      logMethod(`[${msg.scope}]:`, msg.message, msg.stacktrace);
    } else {
      logMethod(`[${msg.scope}]:`, msg.message);
    }
  }
}

export default ConsoleLogAppender;
