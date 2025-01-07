import {
  flattenMessage,
  LogLevel,
  LogMessage,
  LogMessageFormatter,
} from "./log-message";
import { LogAppender } from "./log-appender";

/**
 * A log appender that writes log messages to the console. The behavior of the
 * log appender can be configured with a threshold level and a message
 * formatter.
 *
 * When the message formatter returns a string value, that value is logged to
 * the console as-is. When the message formatter returns an object, a summary
 * string is logged to the console, followed by the object itself. This allows
 * logs to be easily read in the console, while still providing the structured
 * data for inspection in the browser's developer tools.
 */
export class ConsoleLogAppender implements LogAppender {
  public threshold = LogLevel.ALL;
  public formatter: LogMessageFormatter = flattenMessage;

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
      case LogLevel.TRACE:
      case LogLevel.LOG:
        logMethod = console.log;
        break;
      case LogLevel.DEBUG:
        logMethod = console.debug;
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

    const fmtMsg = this.formatter(msg);

    if (typeof fmtMsg === "string") {
      if (msg.error || msg.stacktrace) {
        logMethod(fmtMsg, msg.error ?? msg.stacktrace);
      } else {
        logMethod(fmtMsg);
      }
    } else {
      const { message, _error, _stacktrace, ...rest } = fmtMsg;
      const summary = `${LogLevel[msg.level]} -- ${msg.scope}: ${
        message ?? fmtMsg.method
      }\n`;

      if (msg.error || msg.stacktrace) {
        logMethod(summary, msg.error ?? msg.stacktrace, rest);
      } else {
        logMethod(summary, rest);
      }
    }
  }
}

export default ConsoleLogAppender;
