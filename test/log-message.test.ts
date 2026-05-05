import { describe, test, expect } from "bun:test";
import { parseLogLevel, LogLevel, flattenMessage, LogMessage } from "../src";

describe("parseLogLevel", () => {
  test("parses known level strings case-sensitively", () => {
    expect(parseLogLevel("ALL")).toBe(LogLevel.ALL);
    expect(parseLogLevel("TRACE")).toBe(LogLevel.TRACE);
    expect(parseLogLevel("DEBUG")).toBe(LogLevel.DEBUG);
    expect(parseLogLevel("INFO")).toBe(LogLevel.INFO);
    expect(parseLogLevel("WARN")).toBe(LogLevel.WARN);
    expect(parseLogLevel("ERROR")).toBe(LogLevel.ERROR);
    expect(parseLogLevel("FATAL")).toBe(LogLevel.FATAL);
  });

  test("returns default level for unknown strings", () => {
    expect(parseLogLevel("BOGUS")).toBe(LogLevel.INFO);
    expect(parseLogLevel("")).toBe(LogLevel.INFO);
  });

  test("accepts custom default level", () => {
    expect(parseLogLevel("BOGUS", LogLevel.WARN)).toBe(LogLevel.WARN);
  });
});

describe("flattenMessage", () => {
  test("string message includes all fields", () => {
    const msg: LogMessage = {
      scope: "my-scope",
      level: LogLevel.WARN,
      msg: "a warning",
      ts: new Date("2024-01-01T00:00:00Z"),
      stacktrace: "",
    };

    const flat = flattenMessage(msg);

    expect(flat.scope).toBe("my-scope");
    expect(flat.level).toBe("WARN");
    expect(flat.msg).toBe("a warning");
  });

  test("object message promotes fields, drops reserved keys", () => {
    const msg: LogMessage = {
      scope: "my-scope",
      level: LogLevel.INFO,
      msg: { foo: "bar", baz: 42, scope: "should-be-dropped" },
      ts: new Date("2024-01-01T00:00:00Z"),
      stacktrace: "",
    };

    const flat = flattenMessage(msg);

    expect(flat.foo).toBe("bar");
    expect(flat.baz).toBe(42);
    // Reserved key from the object message should be dropped
    expect(flat.scope).toBe("my-scope");
    expect(flat.level).toBe("INFO");
  });

  test("level is serialized as string name", () => {
    const msg: LogMessage = {
      scope: "test",
      level: LogLevel.ERROR,
      msg: "error msg",
      ts: new Date(),
      stacktrace: "",
    };

    const flat = flattenMessage(msg);
    expect(flat.level).toBe("ERROR");
  });
});
