import { describe, expect, test } from 'bun:test'
import {
  BufferLogAppender,
  LogLevel,
  type LogMessage,
} from '../src'

function makeMsg(overrides: Partial<LogMessage> = {}): LogMessage {
  return {
    scope: 'test-scope',
    level: LogLevel.INFO,
    msg: 'test message',
    stacktrace: '',
    ts: new Date(),
    ...overrides,
  }
}

describe('BufferLogAppender', () => {
  test('defaults to empty buffer, ALL threshold, and bounded size', () => {
    const appender = new BufferLogAppender()

    expect(appender.buffer).toEqual([])
    expect(appender.threshold).toBe(LogLevel.ALL)
    expect(appender.size).toEqual({ target: 1000, max: 1200 })
  })

  test('accepts threshold and size constructor options', () => {
    const appender = new BufferLogAppender(LogLevel.WARN, {
      target: 20,
      max: 30,
    })

    expect(appender.threshold).toBe(LogLevel.WARN)
    expect(appender.size).toEqual({ target: 20, max: 30 })
  })

  test('appends messages to buffer', () => {
    const appender = new BufferLogAppender()

    appender.appendMessage(makeMsg({ msg: 'first' }))
    appender.appendMessage(makeMsg({ msg: 'second' }))

    expect(appender.buffer.length).toBe(2)
    expect(appender.buffer[0].msg).toBe('first')
    expect(appender.buffer[1].msg).toBe('second')
  })

  test('respects threshold', () => {
    const appender = new BufferLogAppender(LogLevel.WARN)

    appender.appendMessage(makeMsg({ level: LogLevel.INFO, msg: 'dropped' }))
    appender.appendMessage(makeMsg({ level: LogLevel.WARN, msg: 'kept' }))
    appender.appendMessage(makeMsg({ level: LogLevel.ERROR, msg: 'also kept' }))

    expect(appender.buffer.length).toBe(2)
    expect(appender.buffer[0].msg).toBe('kept')
    expect(appender.buffer[1].msg).toBe('also kept')
  })

  test('threshold of ALL does not drop messages', () => {
    const appender = new BufferLogAppender(LogLevel.ALL)

    appender.appendMessage(makeMsg({ level: LogLevel.ALL, msg: 'level all' }))
    appender.appendMessage(makeMsg({ level: LogLevel.INFO, msg: 'level info' }))

    expect(appender.buffer.length).toBe(2)
    expect(appender.buffer[0].msg).toBe('level all')
    expect(appender.buffer[1].msg).toBe('level info')
  })

  test('clearBuffer empties the buffer and reassigns the array', () => {
    const appender = new BufferLogAppender()
    appender.appendMessage(makeMsg({ msg: 'to clear' }))
    const existing = appender.buffer

    appender.clearBuffer()

    expect(appender.buffer).toEqual([])
    expect(appender.buffer).not.toBe(existing)
  })

  describe('size bounds', () => {
    test('derives max as 120 percent of target by default', () => {
      const appender = new BufferLogAppender(LogLevel.ALL, { target: 20 })

      expect(appender.size).toEqual({ target: 20, max: 24 })
    })

    test('keeps max at least one greater than target', () => {
      const appender = new BufferLogAppender(LogLevel.ALL, {
        target: 20,
        max: 10,
      })

      expect(appender.size).toEqual({ target: 20, max: 21 })
    })

    test('normalizes fractional and too-small target values', () => {
      const appender = new BufferLogAppender(LogLevel.ALL, { target: 0.5 })

      expect(appender.size).toEqual({ target: 1, max: 2 })
    })

    test('normalizes fractional max values', () => {
      const appender = new BufferLogAppender(LogLevel.ALL, {
        target: 3,
        max: 4.9,
      })

      expect(appender.size).toEqual({ target: 3, max: 4 })
    })

    test('can be disabled for unbounded buffering', () => {
      const appender = new BufferLogAppender(LogLevel.ALL, {
        target: 2,
        max: 3,
      })
      appender.size = undefined

      for (let i = 1; i <= 5; i++) {
        appender.appendMessage(makeMsg({ msg: `message ${i}` }))
      }

      expect(appender.size).toBeUndefined()
      expect(appender.buffer.map((message) => message.msg)).toEqual([
        'message 1',
        'message 2',
        'message 3',
        'message 4',
        'message 5',
      ])
    })

    test('returns size as a defensive copy', () => {
      const appender = new BufferLogAppender(LogLevel.ALL, {
        target: 3,
        max: 4,
      })
      const size = appender.size

      if (size !== undefined) {
        size.max = 1
      }

      expect(appender.size).toEqual({ target: 3, max: 4 })
    })
  })

  describe('buffer trimming', () => {
    test('allows buffer to grow until max is exceeded', () => {
      const appender = new BufferLogAppender(LogLevel.ALL, {
        target: 3,
        max: 5,
      })

      for (let i = 1; i <= 5; i++) {
        appender.appendMessage(makeMsg({ msg: `message ${i}` }))
      }

      expect(appender.buffer.map((message) => message.msg)).toEqual([
        'message 1',
        'message 2',
        'message 3',
        'message 4',
        'message 5',
      ])
    })

    test('batch trims to target when max is exceeded', () => {
      const appender = new BufferLogAppender(LogLevel.ALL, {
        target: 3,
        max: 5,
      })

      for (let i = 1; i <= 6; i++) {
        appender.appendMessage(makeMsg({ msg: `message ${i}` }))
      }

      expect(appender.buffer.map((message) => message.msg)).toEqual([
        'message 4',
        'message 5',
        'message 6',
      ])
    })

    test('reassigns buffer array when trimming', () => {
      const appender = new BufferLogAppender(LogLevel.ALL, {
        target: 2,
        max: 3,
      })

      appender.appendMessage(makeMsg({ msg: 'first' }))
      appender.appendMessage(makeMsg({ msg: 'second' }))
      appender.appendMessage(makeMsg({ msg: 'third' }))
      const existing = appender.buffer
      appender.appendMessage(makeMsg({ msg: 'fourth' }))

      expect(appender.buffer).not.toBe(existing)
      expect(appender.buffer.map((message) => message.msg)).toEqual([
        'third',
        'fourth',
      ])
    })

    test('repairs invalid internal bounds before trimming', () => {
      const appender = new BufferLogAppender(LogLevel.ALL, {
        target: 3,
        max: 4,
      })
      const unsafeAppender = appender as unknown as {
        _size: { target: number, max: number }
      }
      unsafeAppender._size = { target: 3, max: 2 }

      appender.appendMessage(makeMsg({ msg: 'first' }))

      expect(appender.size).toEqual({ target: 3, max: 4 })
      expect(appender.buffer.length).toBe(2)
      expect(appender.buffer[1].level).toBe(LogLevel.ERROR)
      expect(appender.buffer[1].msg).toMatchObject({
        oldSize: { target: 3, max: 2 },
        newSize: { target: 3, max: 4 },
      })
    })
  })
})
