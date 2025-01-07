import { omit } from './util'

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
  message: string | Record<string, unknown>;
  stacktrace?: string;
  error?: Error;
  timestamp: Date;
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
 * logger.info({ foo: 'bar', baz: 'qux', timestamp: 'today', level: LogLevel.WARN });
 * ```
 *
 * Should result after flattening in a structured log message like:
 * ```json
 * {"scope":"example","level":"INFO","foo":"bar","baz":"qux","timestamp":"2020-01-01T00:00:00.000Z"}
 * ```
 */
export function flattenMessage(msg: LogMessage): FlattenedLogMessage {
  if (typeof msg.message === 'string') {
    return { ...msg, level: LogLevel[msg.level] };
  } else {
    const { message, ...rest } = msg;
    return {
      ...omit(message, [
        'scope',
        'level',
        'stacktrace',
        'error',
        'timestamp',
      ]),
      ...rest,
      level: LogLevel[msg.level],
    };
  }
}
export type LogMessageFormatter = (msg: LogMessage) => string | FlattenedLogMessage;

export function structuredLogMessageFormatter(msg: LogMessage): string {
  return JSON.stringify(flattenMessage(msg));
}

export function simpleTextLogMessageFormatter(msg: LogMessage): string {
  return `[${msg.scope}] - ${msg.level}: ${msg.message}`;
}

export default LogMessage;
