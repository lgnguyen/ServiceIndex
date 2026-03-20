import express from "express";
import type { Request, Response } from "express";
import type { Logger } from "./common";
import type { AppContainer } from "./container";
import type { AuthConfig } from "./routes/validators";
import { createRouter } from "./routes";

export interface CreateAppOptions {
  logger?: Logger;
  /** Optional pre-built dependency container (preferred for DI). */
  container?: AppContainer;
  /** Fallback auth config when container is not provided. */
  config?: AuthConfig;
}

/**
 * Create the Express app. Pass config (for validators/auth) and optionally a logger.
 */
export function createApp(opts: CreateAppOptions): express.Express {
    const app = express();
    const { logger } = opts;
    const config = opts.container?.config ?? opts.config ?? { getSecretKey: () => "test-secret" };
    const handlers = opts.container?.handlers;

    app.use(express.json());

    if (logger) {
        addRequestLogging(app, logger);
    }

    // Health check route so the server is demonstrably running
    app.get("/health", (_req: Request, res: Response) => {
        res.status(200).json({ status: "ok" });
    });

    // Root route also returns 200 for convenience
    app.get("/", (_req: Request, res: Response) => {
        res.status(200).json({ data: "Hello World!" });
    });

    // API routes (users, vehicles, service records, alerts) with validation middleware
    app.use("/", createRouter(config, handlers));

    return app;
}

function addRequestLogging(app: express.Express, logger: Logger) {
    app.use((req, _res, next) => {
        req.log = logger.child({
            requestId: (req as Request & { id?: string }).id ?? req.headers["x-request-id"] ?? undefined,
        });
        next();
    });

    app.use((req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
            if (req.log) {
                req.log.info(
                    {
                        method: req.method,
                        url: req.url,
                        statusCode: res.statusCode,
                        durationMs: Date.now() - start,
                    },
                    "request completed"
                );
            }
        });
        next();
    });
}

/** Default app for tests: uses a test auth config. Use createApp({ config, logger }) in production. */
export default createApp({
    config: { getSecretKey: () => process.env.SECRET_KEY ?? "test-secret" },
});
