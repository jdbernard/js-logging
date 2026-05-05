import { describe, test, expect } from "bun:test";
import { Logger, LogLevel, LogMessage } from "../src";

describe("Logger", () => {
  test("uses parent threshold when no threshold is set", () => {
    const parent = new Logger("parent", undefined, LogLevel.WARN);
    const child = new Logger("child", parent);

    // Should not log below WARN (from parent)
    const appender = { threshold: LogLevel.ALL, messages: [] as LogMessage[], appendMessage(msg: LogMessage) { this.messages.push(msg); } };
    child.appenders = [appender];

    child.info("should be dropped");
    child.warn("should be logged");

    expect(appender.messages.length).toBe(1);
    expect(appender.messages[0].msg).toBe("should be logged");
  });

  test("overrides parent threshold when own threshold is set", () => {
    const parent = new Logger("parent", undefined, LogLevel.WARN);
    const child = new Logger("child", parent, LogLevel.ERROR);

    const appender = { threshold: LogLevel.ALL, messages: [] as LogMessage[], appendMessage(msg: LogMessage) { this.messages.push(msg); } };
    child.appenders = [appender];

    child.warn("should be dropped");
    child.error("should be logged");

    expect(appender.messages.length).toBe(1);
    expect(appender.messages[0].msg).toBe("should be logged");
  });

  test("propagates messages to parent appenders", () => {
    const parent = new Logger("parent", undefined, LogLevel.ALL);
    const parentAppender = { threshold: LogLevel.ALL, messages: [] as LogMessage[], appendMessage(msg: LogMessage) { this.messages.push(msg); } };
    parent.appenders = [parentAppender];

    const child = new Logger("child", parent);
    const childAppender = { threshold: LogLevel.ALL, messages: [] as LogMessage[], appendMessage(msg: LogMessage) { this.messages.push(msg); } };
    child.appenders = [childAppender];

    child.info("hello");

    expect(childAppender.messages.length).toBe(1);
    expect(parentAppender.messages.length).toBe(1);
  });

  test("threshold of ALL (0) is not treated as falsy", () => {
    // This is the threshold bug: `this.threshold &&` treats 0 (LogLevel.ALL) as falsy.
    // When threshold is explicitly set to LogLevel.ALL (0), messages at ALL level
    // should still pass through.
    const logger = new Logger("test", undefined, LogLevel.ALL);
    const appender = { threshold: LogLevel.ALL, messages: [] as LogMessage[], appendMessage(msg: LogMessage) { this.messages.push(msg); } };
    logger.appenders = [appender];

    logger.info("should be logged at ALL threshold");

    expect(appender.messages.length).toBe(1);
    expect(appender.messages[0].msg).toBe("should be logged at ALL threshold");
  });

  test("handles deferred messages", () => {
    const logger = new Logger("test", undefined, LogLevel.ALL);
    const appender = { threshold: LogLevel.ALL, messages: [] as LogMessage[], appendMessage(msg: LogMessage) { this.messages.push(msg); } };
    logger.appenders = [appender];

    logger.info(() => "deferred result");

    expect(appender.messages.length).toBe(1);
    expect(appender.messages[0].msg).toBe("deferred result");
  });

  test("handles Error objects", () => {
    const logger = new Logger("test", undefined, LogLevel.ALL);
    const appender = { threshold: LogLevel.ALL, messages: [] as LogMessage[], appendMessage(msg: LogMessage) { this.messages.push(msg); } };
    logger.appenders = [appender];

    const err = new Error("boom");
    logger.error(err);

    expect(appender.messages.length).toBe(1);
    expect(appender.messages[0].msg).toBe("Error: boom");
    expect(appender.messages[0].err).toBe(err);
  });

  test("log methods exist for all levels", () => {
    const logger = new Logger("test", undefined, LogLevel.ALL);
    const appender = { threshold: LogLevel.ALL, messages: [] as LogMessage[], appendMessage(msg: LogMessage) { this.messages.push(msg); } };
    logger.appenders = [appender];

    logger.trace("trace msg");
    logger.debug("debug msg");
    logger.log("log msg");
    logger.info("info msg");
    logger.warn("warn msg");
    logger.error("error msg");
    logger.fatal("fatal msg");

    expect(appender.messages.length).toBe(7);
    expect(appender.messages[0].level).toBe(LogLevel.TRACE);
    expect(appender.messages[6].level).toBe(LogLevel.FATAL);
  });
});
