import { LogLevel } from './log-message';
import Logger from './logger';
export declare class LogService {
    private loggers;
    get ROOT_LOGGER(): Logger;
    constructor();
    getLogger(name: string, threshold?: LogLevel): Logger;
}
export declare const logService: LogService;
export default logService;
