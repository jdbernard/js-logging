"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logService = exports.LogService = void 0;
const log_message_1 = require("./log-message");
const logger_1 = require("./logger");
const ROOT_LOGGER_NAME = 'ROOT';
class LogService {
    constructor() {
        this.loggers = {};
        this.loggers[ROOT_LOGGER_NAME] = new logger_1.default(ROOT_LOGGER_NAME, undefined, log_message_1.LogLevel.ALL);
    }
    get ROOT_LOGGER() {
        return this.loggers[ROOT_LOGGER_NAME];
    }
    getLogger(name, threshold) {
        if (this.loggers[name]) {
            return this.loggers[name];
        }
        let parentLogger;
        const parentLoggerName = Object.keys(this.loggers)
            .filter((n) => name.startsWith(n))
            .reduce((acc, cur) => (acc.length > cur.length ? acc : cur), '');
        if (parentLoggerName) {
            parentLogger = this.loggers[parentLoggerName];
        }
        else {
            parentLogger = this.ROOT_LOGGER;
        }
        this.loggers[name] = parentLogger.createChildLogger(name, threshold);
        return this.loggers[name];
    }
}
exports.LogService = LogService;
exports.logService = new LogService();
exports.default = exports.logService;
