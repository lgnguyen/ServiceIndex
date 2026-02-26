import { Config } from "./config";

function makeEnv(overrides: Record<string, string> = {}): NodeJS.ProcessEnv {
    return {
        SECRET_KEY: "test-secret",
        PORT: "8000",
        NODE_ENV: "development",
        DATABASE_PATH: "./database.db",
        ...overrides,
    };
}

describe("Config", () => {
    describe("getEnvVar", () => {
        it("returns value when env var is set", () => {
            const config = new Config(makeEnv({ FOO: "bar" }));
            expect(config.getEnvVar("FOO")).toBe("bar");
        });

        it("returns default when env var is missing", () => {
            const config = new Config(makeEnv());
            expect(config.getEnvVar("MISSING_VAR", "fallback")).toBe("fallback");
        });

        it("returns default when env var is empty string", () => {
            const config = new Config(makeEnv({ EMPTY: "" }));
            expect(config.getEnvVar("EMPTY", "default")).toBe("default");
        });

        it("throws when env var is missing and no default", () => {
            const config = new Config(makeEnv());
            expect(() => config.getEnvVar("MISSING_VAR")).toThrow(
                "MISSING_VAR environment variable not set, please add it to .env"
            );
        });

        it("throws when env var is empty string and no default", () => {
            const config = new Config(makeEnv({ EMPTY: "" }));
            expect(() => config.getEnvVar("EMPTY")).toThrow(
                "EMPTY environment variable not set, please add it to .env"
            );
        });
    });

    describe("getSecretKey", () => {
        it("returns SECRET_KEY when set", () => {
            const config = new Config(makeEnv({ SECRET_KEY: "my-secret" }));
            expect(config.getSecretKey()).toBe("my-secret");
        });

        it("throws when SECRET_KEY is missing", () => {
            expect(() => new Config({})).toThrow(
                "SECRET_KEY environment variable not set, please add it to .env"
            );
        });

        it("throws when SECRET_KEY is empty", () => {
            expect(() => new Config(makeEnv({ SECRET_KEY: "" }))).toThrow(
                "SECRET_KEY environment variable not set, please add it to .env"
            );
        });
    });

    describe("getPort", () => {
        it("returns PORT as number when set", () => {
            const config = new Config(makeEnv({ PORT: "3000" }));
            expect(config.getPort()).toBe(3000);
        });

        it("returns default 8000 when PORT not set", () => {
            const env = makeEnv();
            delete env.PORT;
            const config = new Config(env);
            expect(config.getPort()).toBe(8000);
        });

        it("throws when PORT is invalid (out of range)", () => {
            expect(() => new Config(makeEnv({ PORT: "0" }))).toThrow(
                "PORT must be between 1 and 65535"
            );
            expect(() => new Config(makeEnv({ PORT: "99999" }))).toThrow(
                "PORT must be between 1 and 65535"
            );
        });
    });

    describe("getNodeEnv", () => {
        it("returns NODE_ENV when set", () => {
            const config = new Config(makeEnv({ NODE_ENV: "production" }));
            expect(config.getNodeEnv()).toBe("production");
        });

        it("returns default development when NODE_ENV not set", () => {
            const env = makeEnv();
            delete env.NODE_ENV;
            const config = new Config(env);
            expect(config.getNodeEnv()).toBe("development");
        });
    });

    describe("getDatabasePath", () => {
        it("returns DATABASE_PATH when set", () => {
            const config = new Config(makeEnv({ DATABASE_PATH: "/data/app.db" }));
            expect(config.getDatabasePath()).toBe("/data/app.db");
        });

        it("returns default when DATABASE_PATH not set", () => {
            const env = makeEnv();
            delete env.DATABASE_PATH;
            const config = new Config(env);
            expect(config.getDatabasePath()).toBe("./database.db");
        });
    });
});
