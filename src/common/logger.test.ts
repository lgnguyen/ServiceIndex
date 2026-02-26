import pino from "pino";
import { createLogger, defaultLogger } from "./logger";

describe("logger", () => {
  it("creates a logger with default options", () => {
    const logger = createLogger();
    expect(logger).toBeTruthy();
    expect(typeof logger.info).toBe("function");
  });

  it("respects explicit level option when set", () => {
    const logger = createLogger({ level: "error" });
    expect(logger.level).toBe("error");
  });

  it("allows overriding options when creating a logger", () => {
    const logger = createLogger({ level: "debug", base: { service: "test-service" } });
    expect(logger.level).toBe("debug");

    // base bindings appear on child loggers; we can at least assert no error when logging
    expect(() => {
      logger.info("test message");
    }).not.toThrow();
  });

  it("provides a shared defaultLogger instance", () => {
    expect(defaultLogger).toBeTruthy();
    expect(typeof defaultLogger.info).toBe("function");
  });

  it("writes log output without throwing", () => {
    const logger = createLogger({ level: "info" });

    expect(() => {
      logger.info({ foo: "bar" }, "hello");
    }).not.toThrow();
  });
});

