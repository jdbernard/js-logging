import { LogLevel, LogMessage } from './log-message';
export default interface LogAppender {
  threshold: LogLevel;
  appendMessage(message: LogMessage): void;
}
