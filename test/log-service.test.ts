import { describe, test, expect } from "bun:test";
import { LogService } from "../src/log-service";

describe("LogService", () => {
  test("creates a root logger on construction", () => {
    const svc = new LogService();

    expect(svc.ROOT_LOGGER).toBeDefined();
    expect(svc.ROOT_LOGGER.name).toBe("ROOT");
  });
});
