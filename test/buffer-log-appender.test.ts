import { describe, test, expect } from "bun:test";
import { BufferLogAppender, LogLevel, LogMessage } from "../src";

function makeMsg(overrides: Partial<LogMessage> = {}): LogMessage {
  return {
    scope: "test-scope",
    level: LogLevel.INFO,
    msg: "test message",
    stacktrace: "",
    ts: new Date(),
    ...overrides,
  };
}

describe("BufferLogAppender", () => {
  test("defaults to empty buffer and ALL threshold", () => {
    const appender = new BufferLogAppender();

    expect(appender.buffer).toEqual([]);
    expect(appender.threshold).toBe(LogLevel.ALL);
  });

  test("accepts initial buffer", () => {
    const existing: LogMessage[] = [makeMsg({ msg: "pre-existing" })];
    const appender = new BufferLogAppender(existing);

    expect(appender.buffer.length).toBe(1);
    expect(appender.buffer[0].msg).toBe("pre-existing");
  });

  test("appends messages to buffer", () => {
    const appender = new BufferLogAppender();

    appender.appendMessage(makeMsg({ msg: "first" }));
    appender.appendMessage(makeMsg({ msg: "second" }));

    expect(appender.buffer.length).toBe(2);
    expect(appender.buffer[0].msg).toBe("first");
    expect(appender.buffer[1].msg).toBe("second");
  });

  test("respects threshold", () => {
    const appender = new BufferLogAppender(undefined, LogLevel.WARN);

    appender.appendMessage(makeMsg({ level: LogLevel.INFO, msg: "dropped" }));
    appender.appendMessage(makeMsg({ level: LogLevel.WARN, msg: "kept" }));
    appender.appendMessage(makeMsg({ level: LogLevel.ERROR, msg: "also kept" }));

    expect(appender.buffer.length).toBe(2);
    expect(appender.buffer[0].msg).toBe("kept");
    expect(appender.buffer[1].msg).toBe("also kept");
  });

  test("threshold of ALL (0) does not cause falsy check to drop messages", () => {
    const appender = new BufferLogAppender(undefined, LogLevel.ALL);

    appender.appendMessage(makeMsg({ level: LogLevel.ALL, msg: "level all" }));
    appender.appendMessage(makeMsg({ level: LogLevel.INFO, msg: "level info" }));

    // Both should be kept — ALL (0) should not be treated as falsy
    expect(appender.buffer.length).toBe(2);
    expect(appender.buffer[0].msg).toBe("level all");
    expect(appender.buffer[1].msg).toBe("level info");
  });

  test("clearBuffer empties the buffer", () => {
    const appender = new BufferLogAppender();
    appender.appendMessage(makeMsg({ msg: "to clear" }));
    expect(appender.buffer.length).toBe(1);

    appender.clearBuffer();
    expect(appender.buffer.length).toBe(0);
  });
});
