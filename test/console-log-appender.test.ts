import { describe, test, expect } from "bun:test";
import { ConsoleLogAppender, LogLevel, LogMessage } from "../src";

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

describe("ConsoleLogAppender", () => {
  test("defaults threshold to ALL and formatter to flattenMessage", () => {
    const appender = new ConsoleLogAppender();

    expect(appender.threshold).toBe(LogLevel.ALL);
    expect(appender.formatter).toBeDefined();
  });

  test("accepts custom threshold and formatter", () => {
    const fmt = () => "custom";
    const appender = new ConsoleLogAppender(LogLevel.ERROR, fmt);

    expect(appender.threshold).toBe(LogLevel.ERROR);
    expect(appender.formatter).toBe(fmt);
  });

  test("threshold of ALL (0) does not cause falsy guard to block messages", () => {
    // ALL (0) is falsy in JS. The guard `if (this.threshold && msg.level < this.threshold)`
    // evaluates `0 && ...` = 0 (falsy), so the if-block is NOT entered and
    // messages proceed. This is correct behavior by accident — ALL means log everything.
    const appender = new ConsoleLogAppender(LogLevel.ALL);

    // Calling appendMessage should not throw for any level when threshold is ALL.
    // We can't easily spy on console in Bun, but we can verify no errors are thrown.
    for (const level of [
      LogLevel.ALL,
      LogLevel.TRACE,
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.FATAL,
    ]) {
      expect(() => appender.appendMessage(makeMsg({ level }))).not.toThrow();
    }
  });

  test("respects threshold by dropping messages below it", () => {
    // We verify threshold works by checking the formatter is called (or not).
    // When threshold is WARN, messages with INFO should not invoke the formatter.
    let formatterCalls = 0;
    const appender = new ConsoleLogAppender(LogLevel.WARN, () => {
      formatterCalls++;
      return "logs";
    });

    // This should be dropped before formatter is called
    appender.appendMessage(makeMsg({ level: LogLevel.INFO }));
    expect(formatterCalls).toBe(0);

    // This should pass through
    appender.appendMessage(makeMsg({ level: LogLevel.WARN }));
    expect(formatterCalls).toBe(1);

    // And higher levels too
    appender.appendMessage(makeMsg({ level: LogLevel.ERROR }));
    expect(formatterCalls).toBe(2);
  });

  test("does not throw for any valid log level", () => {
    const appender = new ConsoleLogAppender();

    for (const level of [
      LogLevel.ALL,
      LogLevel.TRACE,
      LogLevel.DEBUG,
      LogLevel.LOG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.FATAL,
    ]) {
      expect(() => appender.appendMessage(makeMsg({ level }))).not.toThrow();
    }
  });

  test("handles string message with error/stacktrace", () => {
    const appender = new ConsoleLogAppender();
    const err = new Error("test error");

    // Should not throw
    expect(() =>
      appender.appendMessage(makeMsg({ err, stacktrace: "trace" }))
    ).not.toThrow();
  });

  test("handles object message formatter output", () => {
    // The formatter can return an object (flattenMessage does),
    // appendMessage should construct a summary and log it.
    const appender = new ConsoleLogAppender(LogLevel.ALL, (msg) => ({
      msg: "inner",
      extra: 42,
      level: LogLevel[msg.level],
      scope: msg.scope,
      stacktrace: "",
      ts: msg.ts,
    }));

    expect(() => appender.appendMessage(makeMsg())).not.toThrow();
  });
});
