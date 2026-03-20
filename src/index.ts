import "dotenv/config";
import sqlite3 from "sqlite3";
import { createApp } from "./app";
import { Config, defaultLogger } from "./common";
import { createAppContainer } from "./container";

const config = new Config();
const logger = defaultLogger;
const container = createAppContainer(config);
const app = createApp({ logger, container });

// Local database (kept for existing shutdown behavior)
const db = new sqlite3.Database(config.getDatabasePath());

const server = app.listen(config.getPort(), () => {
    logger.info({ port: config.getPort() }, "Server running");
});

const shutdown = (signal: string) => {
    logger.info({ signal }, "Shutdown signal received, closing resources");

    server.close(() => {
        logger.info("Http server closed");
    });

    db.close();
    logger.info("SQLite DB closed");

    process.exit(0);
};

process.on("SIGTERM", () => {
    shutdown("SIGTERM");
});

process.on("SIGINT", () => {
    shutdown("SIGINT");
});
