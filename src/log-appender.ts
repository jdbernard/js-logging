import { LogLevel, LogMessage } from './log-message';

export interface LogAppender {
  threshold: LogLevel;
  appendMessage(message: LogMessage): void;
}

export default LogAppender;
