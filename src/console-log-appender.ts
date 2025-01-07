import {
  flattenMessage,
  LogLevel,
  LogMessage,
  LogMessageFormatter,
} from './log-message';
import { LogAppender } from './log-appender';

export class ConsoleLogAppender implements LogAppender {
  public threshold = LogLevel.ALL;
  public formatter: LogMessageFormatter = flattenMessage

  constructor(threshold?: LogLevel, formatter?: LogMessageFormatter) {
    if (threshold) {
      this.threshold = threshold;
    }
    if (formatter) {
      this.formatter = formatter;
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

    const strMsg = this.formatter(msg);

    if (msg.error || msg.stacktrace) {
      logMethod(strMsg, msg.error ?? msg.stacktrace);
    } else {
      logMethod(strMsg);
    }
  }
}

export default ConsoleLogAppender;
