import { omit } from "./util";

export enum LogLevel {
  ALL = 0,
  TRACE,
  DEBUG,
  LOG,
  INFO,
  WARN,
  ERROR,
  FATAL,
}

export function parseLogLevel(
  str: string,
  defaultLevel = LogLevel.INFO,
): LogLevel {
  if (str in LogLevel) {
    return LogLevel[str as keyof typeof LogLevel] as LogLevel;
  } else {
    return defaultLevel;
  }
}

export interface LogMessage {
  scope: string;
  level: LogLevel;
  msg: string | Record<string, unknown>;
  stacktrace?: string;
  err?: Error;
  ts: Date;
}

export type FlattenedLogMessage = Record<string, unknown>;

/**
 * Flatten a log message to a plain object. The *message* field can be either a
 * string or an object. In the case of an object message, the LogMessage should
 * be flattened before being emitted by an appender, promoting the object's
 * fields to the top level of the message. Fields defined on the *LogMessage*
 * interface are reserved and should not be used as keys in the message object
 * (and will be ignored if they are).
 *
 * So, for example:
 *
 * ```typescript
 * const logger = logService.getLogger('example');
 * logger.info({ foo: 'bar', baz: 'qux', ts: 'today', level: LogLevel.WARN });
 * ```
 *
 * Should result after flattening in a structured log message like:
 * ```json
 * {"scope":"example","level":"INFO","foo":"bar","baz":"qux","ts":"2020-01-01T00:00:00.000Z"}
 * ```
 */
export function flattenMessage(logMsg: LogMessage): FlattenedLogMessage {
  if (typeof logMsg.msg === "string") {
    return { ...logMsg, level: LogLevel[logMsg.level] };
  } else {
    const { msg, ...rest } = logMsg;
    return {
      ...omit(msg, [
        "scope",
        "level",
        "stacktrace",
        "err",
        "ts",
      ]),
      ...rest,
      level: LogLevel[logMsg.level],
    };
  }
}
export type LogMessageFormatter = (
  msg: LogMessage,
) => string | FlattenedLogMessage;

export function structuredLogMessageFormatter(msg: LogMessage): string {
  return JSON.stringify(flattenMessage(msg));
}

export function simpleTextLogMessageFormatter(msg: LogMessage): string {
  return `[${msg.scope}] - ${msg.level}: ${msg.msg}`;
}

export default LogMessage;
