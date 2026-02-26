import express from "express";
import type { Request, Response } from "express";
import type { Logger } from "./common";

export interface CreateAppOptions {
  logger?: Logger;
}

/**
 * Create the Express app. Pass a logger to enable request logging and to have
 * it available for injection into handlers (e.g. via req.log or via DI).
 */
export function createApp(opts: CreateAppOptions = {}): express.Express {
    const app = express();
    const { logger } = opts;

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

/** Default app instance (no logger). Use createApp({ logger }) when you have a logger to inject. */
export default createApp();
