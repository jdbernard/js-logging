"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const log_message_1 = require("./log-message");
class Logger {
    constructor(name, parentLogger, threshold) {
        this.name = name;
        this.parentLogger = parentLogger;
        this.threshold = threshold;
        this.appenders = [];
    }
    createChildLogger(name, threshold) {
        return new Logger(name, this, threshold);
    }
    doLog(level, message, stacktrace) {
        if (level < this.getEffectiveThreshold()) {
            return;
        }
        const logMsg = {
            scope: this.name,
            level,
            message: '',
            stacktrace: '',
            timestamp: new Date()
        };
        if (message === undefined || message === null) {
            logMsg.message = message;
            logMsg.stacktrace = stacktrace == null ? '' : stacktrace;
        }
        else if (message.call !== undefined) {
            logMsg.message = message();
            logMsg.stacktrace = stacktrace == null ? '' : stacktrace;
        }
        else if (message instanceof Error) {
            const error = message;
            logMsg.error = error;
            logMsg.message = `${error.name}: ${error.message}`;
            logMsg.stacktrace = error.stack == null ? '' : error.stack;
        }
        else {
            // string | object
            logMsg.message = message;
            logMsg.stacktrace = stacktrace == null ? '' : stacktrace;
        }
        this.sendToAppenders(logMsg);
    }
    trace(message, stacktrace) {
        this.doLog(log_message_1.LogLevel.TRACE, message, stacktrace);
    }
    debug(message, stacktrace) {
        this.doLog(log_message_1.LogLevel.DEBUG, message, stacktrace);
    }
    log(message, stacktrace) {
        this.doLog(log_message_1.LogLevel.LOG, message, stacktrace);
    }
    info(message, stacktrace) {
        this.doLog(log_message_1.LogLevel.INFO, message, stacktrace);
    }
    warn(message, stacktrace) {
        this.doLog(log_message_1.LogLevel.WARN, message, stacktrace);
    }
    error(message, stacktrace) {
        this.doLog(log_message_1.LogLevel.ERROR, message, stacktrace);
    }
    fatal(message, stacktrace) {
        this.doLog(log_message_1.LogLevel.FATAL, message, stacktrace);
    }
    sendToAppenders(logMsg) {
        this.appenders.forEach(app => {
            app.appendMessage(logMsg);
        });
        if (this.parentLogger) {
            this.parentLogger.sendToAppenders(logMsg);
        }
    }
    getEffectiveThreshold() {
        if (this.threshold) {
            return this.threshold;
        }
        if (this.parentLogger) {
            return this.parentLogger.getEffectiveThreshold();
        }
        // should never happen (root logger should always have a threshold
        return log_message_1.LogLevel.ALL;
    }
}
exports.Logger = Logger;
exports.default = Logger;
