"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLogAppender = void 0;
/*tslint:disable:no-console*/
const log_message_1 = require("./log-message");
class ConsoleLogAppender {
    constructor(threshold) {
        this.threshold = log_message_1.LogLevel.ALL;
        if (threshold) {
            this.threshold = threshold;
        }
    }
    appendMessage(msg) {
        if (this.threshold && msg.level < this.threshold) {
            return;
        }
        let logMethod = console.log;
        switch (msg.level) {
            case log_message_1.LogLevel.ALL:
                logMethod = console.log;
                break;
            case log_message_1.LogLevel.TRACE:
                logMethod = console.log;
                break;
            case log_message_1.LogLevel.DEBUG:
                logMethod = console.debug;
                break;
            case log_message_1.LogLevel.LOG:
                logMethod = console.log;
                break;
            case log_message_1.LogLevel.INFO:
                logMethod = console.info;
                break;
            case log_message_1.LogLevel.WARN:
                logMethod = console.warn;
                break;
            case log_message_1.LogLevel.ERROR:
            case log_message_1.LogLevel.FATAL:
                logMethod = console.trace;
                break;
        }
        if (msg.error) {
            logMethod(`[${msg.scope}]:`, msg.message, msg.error);
        }
        else if (msg.stacktrace) {
            logMethod(`[${msg.scope}]:`, msg.message, msg.stacktrace);
        }
        else {
            logMethod(`[${msg.scope}]:`, msg.message);
        }
    }
}
exports.ConsoleLogAppender = ConsoleLogAppender;
exports.default = ConsoleLogAppender;
