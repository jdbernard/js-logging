import type { LogAppender } from './log-appender'
import { LogLevel, type LogMessage } from './log-message'
import { clamp } from './util'

export interface BufferSizeBounds {
  target: number
  max: number
}

export class BufferLogAppender implements LogAppender {
  public threshold: LogLevel
  public buffer: LogMessage[]

  private _size?: BufferSizeBounds

  public get size() {
    return this._size === undefined ? undefined : { ...this._size }
  }

  public set size(s: {target: number, max?: number} | undefined) {
    if (s === undefined) {
      this._size = undefined
    } else {
      const target = clamp(s.target, { min: 1 })
      this._size = {
        target,
        max: s.max === undefined
          ? clamp(target * 1.2, { min: target + 1 })
          : clamp(s.max, { min: target + 1 })
      }
    }
  }

  constructor(threshold?: LogLevel, size?: {target: number, max?: number}) {
    if (size !== undefined && typeof size === 'object') {
      this.size = size
    } else {
      this._size = { target: 1000, max: 1200 }
    }

    this.buffer = []
    this.threshold = threshold ?? LogLevel.ALL
  }

  public appendMessage(msg: LogMessage): void {
    if (this.threshold && msg.level < this.threshold) return

    this.buffer.push(msg)

    if (this._size !== undefined) {

      if (this._size.max <= this._size.target) {
        // This should be impossible, so if it happens, I want to know.
        const oldSize = this.size
        this.size = { target: this._size.target }
        this.buffer.push({
          scope: '@jdbernard/js-logging/buffer-log-appender.ts',
          level: LogLevel.ERROR,
          msg: {
            msg: 'BufferLogAppender misconfigured: max size was not greater ' +
            'than target size. Reconfiguring.',
            oldSize,
            newSize: this.size
          },
          ts: new Date()
        })
      }

      if (this.buffer.length > this._size.max) {
        this.buffer = this.buffer.slice(-this._size.target)
      }
    }
  }

  public clearBuffer(): void {
    this.buffer = []
  }
}
