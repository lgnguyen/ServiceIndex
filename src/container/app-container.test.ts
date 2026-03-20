import { Config } from "../common/config";
import { createAppContainer } from "./app-container";

function makeEnv(overrides: Record<string, string> = {}): NodeJS.ProcessEnv {
    return {
        SECRET_KEY: "test-secret",
        PORT: "8000",
        NODE_ENV: "test",
        DATABASE_PATH: ":memory:",
        ...overrides,
    };
}

describe("app container", () => {
    it("resolves config, repositories, and handlers via injection", () => {
        const config = new Config(makeEnv());
        const container = createAppContainer(config);

        expect(container.config).toBe(config);
        expect(container.repositories.users).toBeDefined();
        expect(container.repositories.vehicles).toBeDefined();
        expect(container.repositories.serviceRecords).toBeDefined();
        expect(container.repositories.serviceItems).toBeDefined();
        expect(container.repositories.makes).toBeDefined();
        expect(container.repositories.models).toBeDefined();
        expect(container.repositories.alerts).toBeDefined();

        expect(container.handlers.users.createUser).toBeDefined();
        expect(container.handlers.vehicles.createVehicle).toBeDefined();
        expect(container.handlers.serviceRecords.createServiceRecord).toBeDefined();
        expect(container.handlers.alerts.createAlert).toBeDefined();
    });

    it("builds stable handler function references from one container", () => {
        const config = new Config(makeEnv());
        const container = createAppContainer(config);

        const firstCreateUser = container.handlers.users.createUser;
        const secondCreateUser = container.handlers.users.createUser;
        expect(firstCreateUser).toBe(secondCreateUser);
    });
});

