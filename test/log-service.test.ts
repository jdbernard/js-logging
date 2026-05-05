import { describe, test, expect } from "bun:test";
import { LogService, LogLevel } from "../src";

describe("LogService", () => {
  test("creates a root logger on construction", () => {
    const svc = new LogService();

    expect(svc.ROOT_LOGGER).toBeDefined();
    expect(svc.ROOT_LOGGER.name).toBe("ROOT");
  });

  test("root logger defaults to ALL threshold", () => {
    const svc = new LogService();

    expect(svc.ROOT_LOGGER.threshold).toBe(LogLevel.ALL);
  });

  test("getLogger returns the same instance for the same name", () => {
    const svc = new LogService();

    const a = svc.getLogger("foo");
    const b = svc.getLogger("foo");

    expect(a).toBe(b);
  });

  test("getLogger creates hierarchical loggers", () => {
    const svc = new LogService();

    const foo = svc.getLogger("foo");
    const fooBar = svc.getLogger("foo.bar");
    const fooBarBaz = svc.getLogger("foo.bar.baz");

    // foo.bar should be a child of foo
    // We can verify by checking threshold propagation
    foo.appenders = [{
      threshold: LogLevel.ALL,
      messages: [] as any[],
      appendMessage(m: any) { this.messages!.push(m); },
    }];

    fooBar.info("propagate");

    // The foo appender should receive the message from fooBar
    expect(foo.appenders[0].messages.length).toBe(1);
  });

  test("getLogger allows setting threshold", () => {
    const svc = new LogService();

    const logger = svc.getLogger("with-threshold", LogLevel.ERROR);
    expect(logger.threshold).toBe(LogLevel.ERROR);
  });
});
