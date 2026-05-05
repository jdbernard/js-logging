import type {
  LogLevel,
  LogMessage
} from './log-message'

export class BufferLogAppender implements LogAppender {
  public threshold = LogLevel.ALL
  public buffer: LogMessage[]

  constructor(buffer: LogMessage[], threshold?: LogLevel) {
    this.buffer = buffer

    if (threshold) {
      this.threshold = threshold
    }
  }

  public appendMessage(msg: LogMessage): void {
    if (this.threshold && msg.level < this.threshold) return
    else buffer.push(msg)
  }

  public clearBuffer(): void {
    this.buffer.length = 0
  }
}
