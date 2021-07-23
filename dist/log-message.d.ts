export declare enum LogLevel {
    ALL = 0,
    TRACE = 1,
    DEBUG = 2,
    LOG = 3,
    INFO = 4,
    WARN = 5,
    ERROR = 6,
    FATAL = 7
}
export declare function parseLogLevel(str: string, defaultLevel?: LogLevel): LogLevel;
export interface LogMessage {
    scope: string;
    level: LogLevel;
    message: string | object;
    stacktrace: string;
    error?: Error;
    timestamp: Date;
}
export default LogMessage;
