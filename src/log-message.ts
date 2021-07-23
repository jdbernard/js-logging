export enum LogLevel {
  ALL = 0,
  TRACE,
  DEBUG,
  LOG,
  INFO,
  WARN,
  ERROR,
  FATAL
}

const kv = 'WARN';
const TEST = LogLevel[kv];

export function parseLogLevel(str: string, defaultLevel = LogLevel.INFO): LogLevel {
  if (Object.prototype.hasOwnProperty.call(LogLevel, str)) {
    return LogLevel[<any>str] as unknown as LogLevel;
  } else {
    return defaultLevel;
  }
}

export interface LogMessage {
  scope: string;
  level: LogLevel;
  message: string | object;
  stacktrace: string;
  error?: Error;
  timestamp: Date;
}

export default LogMessage;
