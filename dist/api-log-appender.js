"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiLogAppender = void 0;
const axios_1 = require("axios");
const log_message_1 = require("./log-message");
class ApiLogAppender {
    constructor(apiEndpoint, authToken, threshold) {
        this.apiEndpoint = apiEndpoint;
        this.authToken = authToken;
        this.batchSize = 10;
        this.minimumTimePassedInSec = 60;
        this.maximumTimePassedInSec = 120;
        this.threshold = log_message_1.LogLevel.ALL;
        this.http = axios_1.default.create();
        this.msgBuffer = [];
        this.lastSent = 0;
        this.checkPost = () => {
            const now = Date.now();
            const min = this.lastSent + this.minimumTimePassedInSec * 1000;
            const max = this.lastSent + this.maximumTimePassedInSec * 1000;
            if ((this.msgBuffer.length >= this.batchSize && min < now) ||
                (this.msgBuffer.length > 0 && max < now)) {
                this.doPost();
            }
            setTimeout(this.checkPost, Math.max(10000, this.minimumTimePassedInSec * 1000));
        };
        setTimeout(this.checkPost, 1000);
        if (threshold) {
            this.threshold = threshold;
        }
    }
    appendMessage(msg) {
        if (this.threshold && msg.level < this.threshold) {
            return;
        }
        this.msgBuffer.push({
            level: log_message_1.LogLevel[msg.level],
            message: typeof msg.message === 'string'
                ? msg.message
                : JSON.stringify(msg.message),
            scope: msg.scope,
            stacktrace: msg.stacktrace,
            timestamp: msg.timestamp.toISOString()
        });
    }
    doPost() {
        if (this.msgBuffer.length > 0 && this.authToken) {
            this.http.post(this.apiEndpoint, this.msgBuffer, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.authToken}`
                }
            });
            this.lastSent = Date.now();
            this.msgBuffer = [];
        }
    }
}
exports.ApiLogAppender = ApiLogAppender;
exports.default = ApiLogAppender;
