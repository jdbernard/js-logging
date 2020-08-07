import Axios from 'axios';

import { LogMessage, LogLevel } from './log-message';
import LogAppender from './log-appender';

interface ApiMessage {
  level: string;
  message: string;
  scope: string;
  stacktrace: string;
  timestamp: string;
}
export class ApiLogAppender implements LogAppender {
  public batchSize = 10;
  public minimumTimePassedInSec = 60;
  public maximumTimePassedInSec = 120;
  public threshold = LogLevel.ALL;

  private http = Axios.create();
  private msgBuffer: ApiMessage[] = [];
  private lastSent = 0;

  constructor(
    public readonly apiEndpoint: string,
    public authToken?: string,
    threshold?: LogLevel
  ) {
    setTimeout(this.checkPost, 1000);
    if (threshold) {
      this.threshold = threshold;
    }
  }

  public appendMessage(msg: LogMessage): void {
    if (this.threshold && msg.level < this.threshold) {
      return;
    }

    this.msgBuffer.push({
      level: LogLevel[msg.level],
      message:
        typeof msg.message === 'string'
          ? msg.message
          : JSON.stringify(msg.message),
      scope: msg.scope,
      stacktrace: msg.stacktrace,
      timestamp: msg.timestamp.toISOString()
    });
  }

  private doPost() {
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

  private checkPost = () => {
    const now = Date.now();
    const min = this.lastSent + this.minimumTimePassedInSec * 1000;
    const max = this.lastSent + this.maximumTimePassedInSec * 1000;

    if (
      (this.msgBuffer.length >= this.batchSize && min < now) ||
      (this.msgBuffer.length > 0 && max < now)
    ) {
      this.doPost();
    }
    setTimeout(
      this.checkPost,
      Math.max(10000, this.minimumTimePassedInSec * 1000)
    );
  };
}

export default ApiLogAppender;
