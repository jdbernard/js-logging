import type { LogAppender } from './log-appender'
import { LogLevel, type LogMessage } from './log-message'

export class BufferLogAppender implements LogAppender {
  public threshold: LogLevel
  public buffer: LogMessage[]
  public bufferMax?: number

  constructor(buffer?: LogMessage[], threshold?: LogLevel) {
    this.buffer = buffer ?? []
    this.threshold = threshold ?? LogLevel.ALL
  }

  public appendMessage(msg: LogMessage): void {
    if (this.threshold && msg.level < this.threshold) return

    this.buffer.push(msg)

    if (this.bufferMax !== undefined) {
      const max = Math.max(0, this.bufferMax)
      while (this.buffer.length > max) {
        this.buffer.shift()
      }
    }
  }

  public clearBuffer(): void {
    this.buffer.length = 0
  }
}
