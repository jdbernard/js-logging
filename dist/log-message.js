"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLogLevel = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ALL"] = 0] = "ALL";
    LogLevel[LogLevel["TRACE"] = 1] = "TRACE";
    LogLevel[LogLevel["DEBUG"] = 2] = "DEBUG";
    LogLevel[LogLevel["LOG"] = 3] = "LOG";
    LogLevel[LogLevel["INFO"] = 4] = "INFO";
    LogLevel[LogLevel["WARN"] = 5] = "WARN";
    LogLevel[LogLevel["ERROR"] = 6] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 7] = "FATAL";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
const kv = 'WARN';
const TEST = LogLevel[kv];
function parseLogLevel(str, defaultLevel = LogLevel.INFO) {
    if (Object.prototype.hasOwnProperty.call(LogLevel, str)) {
        return LogLevel[str];
    }
    else {
        return defaultLevel;
    }
}
exports.parseLogLevel = parseLogLevel;
