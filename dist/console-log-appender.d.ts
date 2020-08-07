import { LogMessage, LogLevel } from './log-message';
import LogAppender from './log-appender';
export declare class ConsoleLogAppender implements LogAppender {
    threshold: LogLevel;
    constructor(threshold?: LogLevel);
    appendMessage(msg: LogMessage): void;
}
export default ConsoleLogAppender;
