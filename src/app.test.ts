import request from "supertest";
import app, { createApp } from "./app";
import type { Logger } from "./common";

describe("Express app", () => {
    describe("GET /health", () => {
        it("returns 200 and status ok", async () => {
            const res = await request(app).get("/health");
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ status: "ok" });
        });
    });

    describe("GET /", () => {
        it("returns 200 and hello world data", async () => {
            const res = await request(app).get("/");
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ data: "Hello World!" });
        });
    });

    describe("logging middleware", () => {
        class FakeLogger {
            public infos: Array<{ obj: unknown; msg?: string }> = [];

            // Minimal subset of pino.Logger used by the app
            child(): Logger {
                return this as unknown as Logger;
            }

            info(obj: unknown, msg?: string): void {
                this.infos.push({ obj, msg });
            }
        }

        it("attaches a logger and logs requests when provided", async () => {
            const fakeLogger = new FakeLogger();
            const appWithLogger = createApp({
                logger: fakeLogger as unknown as Logger,
                config: { getSecretKey: () => "test-secret" },
            });

            const res = await request(appWithLogger).get("/health");
            expect(res.status).toBe(200);

            // One log entry for the completed request
            expect(fakeLogger.infos.length).toBe(1);
            const entry = fakeLogger.infos[0];
            expect(entry.msg).toBe("request completed");
            expect(entry.obj).toMatchObject({
                method: "GET",
                url: "/health",
                statusCode: 200,
            });
        });
    });
});
