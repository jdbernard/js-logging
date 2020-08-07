import { LogMessage, LogLevel } from './log-message';
import LogAppender from './log-appender';
export declare class ApiLogAppender implements LogAppender {
    readonly apiEndpoint: string;
    authToken?: string | undefined;
    batchSize: number;
    minimumTimePassedInSec: number;
    maximumTimePassedInSec: number;
    threshold: LogLevel;
    private http;
    private msgBuffer;
    private lastSent;
    constructor(apiEndpoint: string, authToken?: string | undefined, threshold?: LogLevel);
    appendMessage(msg: LogMessage): void;
    private doPost;
    private checkPost;
}
export default ApiLogAppender;
