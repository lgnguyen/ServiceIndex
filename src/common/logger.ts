import pino from "pino";

export type Logger = pino.Logger;

const defaultOptions: pino.LoggerOptions = {
    level: process.env.LOG_LEVEL ?? "info",
    transport:
    process.env.NODE_ENV !== "production"
    	? { target: "pino-pretty", options: { colorize: true } }
    	: undefined,
};

/**
 * Create a logger instance. Use this in DI to create one logger and inject it.
 * Options can override level, redact, or add base bindings.
 */
export function createLogger(options?: pino.LoggerOptions): Logger {
    return pino({ ...defaultOptions, ...options });
}

/** Default logger for use before DI is wired. Prefer injecting a logger from createLogger(). */
export const defaultLogger = createLogger();
