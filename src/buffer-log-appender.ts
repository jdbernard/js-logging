import type { LogAppender } from './log-appender'
import { LogLevel, type LogMessage } from './log-message'

export class BufferLogAppender implements LogAppender {
  public threshold: LogLevel
  public buffer: LogMessage[]

  constructor(buffer?: LogMessage[], threshold?: LogLevel) {
    this.buffer = buffer ?? []
    this.threshold = threshold ?? LogLevel.ALL
  }

  public appendMessage(msg: LogMessage): void {
    if (this.threshold && msg.level < this.threshold) return
    else this.buffer.push(msg)
  }

  public clearBuffer(): void {
    this.buffer.length = 0
  }
}
