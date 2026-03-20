import { Sequelize } from "sequelize";
import { Config } from "../common/config";
import { createSequelize } from "./index";
import { rollbackLastMigration, runMigrations } from "./migrate";

function makeEnv(overrides: Record<string, string> = {}): NodeJS.ProcessEnv {
    return {
        SECRET_KEY: "test-secret",
        PORT: "8000",
        NODE_ENV: "test",
        DATABASE_PATH: ":memory:",
        ...overrides,
    };
}

async function selectCount(sequelize: Sequelize, tableName: string): Promise<number> {
    const [rows] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    return Number((rows as Array<{ count: number | string }>)[0]?.count ?? 0);
}

describe("database migrations", () => {
    let sequelize: Sequelize;

    beforeEach(() => {
        const config = new Config(makeEnv());
        sequelize = createSequelize(config);
    });

    afterEach(async () => {
        await sequelize.close();
    });

    it("creates the full schema and seeds reference data", async () => {
        await runMigrations(sequelize);

        const tables = await sequelize.getQueryInterface().showAllTables();
        expect(tables).toEqual(
            expect.arrayContaining([
                "_database_migrations",
                "users",
                "vehicles",
                "service_records",
                "service_items",
                "makes",
                "models",
                "alerts",
            ])
        );

        expect(await selectCount(sequelize, "makes")).toBeGreaterThanOrEqual(4);
        expect(await selectCount(sequelize, "models")).toBeGreaterThanOrEqual(6);
        expect(await selectCount(sequelize, "service_items")).toBeGreaterThanOrEqual(10);

        const [serviceItems] = await sequelize.query(
            "SELECT itemType FROM service_items ORDER BY itemType ASC"
        );
        expect((serviceItems as Array<{ itemType: string }>).map((row) => row.itemType)).toEqual(
            expect.arrayContaining(["Oil Change", "Battery", "Wipers"])
        );
    });

    it("is idempotent when rerun", async () => {
        await runMigrations(sequelize);
        await runMigrations(sequelize);

        expect(await selectCount(sequelize, "_database_migrations")).toBe(2);
        expect(await selectCount(sequelize, "makes")).toBeGreaterThanOrEqual(4);
        expect(await selectCount(sequelize, "service_items")).toBeGreaterThanOrEqual(10);
    });

    it("can roll back applied migrations in reverse order", async () => {
        await runMigrations(sequelize);

        await rollbackLastMigration(sequelize);
        expect(await selectCount(sequelize, "_database_migrations")).toBe(1);
        expect(await selectCount(sequelize, "service_items")).toBe(0);
        expect(await selectCount(sequelize, "makes")).toBe(0);

        await rollbackLastMigration(sequelize);
        expect(await selectCount(sequelize, "_database_migrations")).toBe(0);

        const tables = await sequelize.getQueryInterface().showAllTables();
        expect(tables).toEqual(expect.arrayContaining(["_database_migrations"]));
        expect(tables).not.toEqual(expect.arrayContaining(["users", "vehicles", "alerts"]));
    });
});

