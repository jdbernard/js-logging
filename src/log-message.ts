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

export interface LogMessage {
  scope: string;
  level: LogLevel;
  message: string | object;
  stacktrace: string;
  error?: Error;
  timestamp: Date;
}

export default LogMessage;
