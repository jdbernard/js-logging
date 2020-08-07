import { LogMessage, LogLevel } from './log-message';
import LogAppender from './log-appender';
export declare type DeferredMsg = () => string | object;
export declare type MessageType = string | DeferredMsg | object;
export declare class Logger {
    readonly name: string;
    private parentLogger?;
    threshold?: LogLevel | undefined;
    appenders: LogAppender[];
    constructor(name: string, parentLogger?: Logger | undefined, threshold?: LogLevel | undefined);
    createChildLogger(name: string, threshold?: LogLevel): Logger;
    doLog(level: LogLevel, message: Error | MessageType, stacktrace?: string): void;
    trace(message: Error | MessageType, stacktrace?: string): void;
    debug(message: Error | MessageType, stacktrace?: string): void;
    log(message: MessageType, stacktrace?: string): void;
    info(message: MessageType, stacktrace?: string): void;
    warn(message: MessageType, stacktrace?: string): void;
    error(message: Error | MessageType, stacktrace?: string): void;
    fatal(message: Error | MessageType, stacktrace?: string): void;
    protected sendToAppenders(logMsg: LogMessage): void;
    protected getEffectiveThreshold(): LogLevel;
}
export default Logger;
