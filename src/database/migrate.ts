import "dotenv/config";
import { DataTypes } from "sequelize";
import type { Sequelize } from "sequelize";
import { Config } from "../common/config";
import { createSequelize } from "./index";
import { databaseMigrations } from "./migrations";
import type { DatabaseMigration } from "./migrations/types";

const MIGRATIONS_TABLE = "_database_migrations";

async function ensureMigrationsTable(sequelize: Sequelize) {
    await sequelize.getQueryInterface().createTable(MIGRATIONS_TABLE, {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        executedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }).catch(async (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.toLowerCase().includes("already exists")) {
            throw error;
        }
    });
}

async function getAppliedMigrationNames(sequelize: Sequelize): Promise<Set<string>> {
    const [rows] = await sequelize.query(`SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY executedAt ASC`);
    return new Set((rows as Array<{ name: string }>).map((row) => row.name));
}

async function recordMigration(sequelize: Sequelize, migration: DatabaseMigration) {
    await sequelize.getQueryInterface().bulkInsert(MIGRATIONS_TABLE, [
        {
            name: migration.name,
            executedAt: new Date(),
        },
    ]);
}

async function removeMigrationRecord(sequelize: Sequelize, migration: DatabaseMigration) {
    await sequelize.getQueryInterface().bulkDelete(MIGRATIONS_TABLE, { name: migration.name });
}

export async function runMigrations(
    sequelize: Sequelize,
    migrations: DatabaseMigration[] = databaseMigrations
) {
    await ensureMigrationsTable(sequelize);

    const appliedMigrations = await getAppliedMigrationNames(sequelize);
    for (const migration of migrations) {
        if (appliedMigrations.has(migration.name)) {
            continue;
        }

        await migration.up({
            queryInterface: sequelize.getQueryInterface(),
            sequelize,
            dataTypes: DataTypes,
        });
        await recordMigration(sequelize, migration);
    }
}

export async function rollbackLastMigration(
    sequelize: Sequelize,
    migrations: DatabaseMigration[] = databaseMigrations
) {
    await ensureMigrationsTable(sequelize);

    const [rows] = await sequelize.query(
        `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY executedAt DESC LIMIT 1`
    );
    const lastAppliedName = (rows as Array<{ name: string }>)[0]?.name;
    if (!lastAppliedName) {
        return;
    }

    const migration = [...migrations].reverse().find((item) => item.name === lastAppliedName);
    if (!migration) {
        throw new Error(`Migration "${lastAppliedName}" is recorded but not registered.`);
    }

    await migration.down({
        queryInterface: sequelize.getQueryInterface(),
        sequelize,
        dataTypes: DataTypes,
    });
    await removeMigrationRecord(sequelize, migration);
}

export async function migrateDatabase(config = new Config()) {
    const sequelize = createSequelize(config);
    try {
        await runMigrations(sequelize);
    } finally {
        await sequelize.close();
    }
}

export async function undoLastDatabaseMigration(config = new Config()) {
    const sequelize = createSequelize(config);
    try {
        await rollbackLastMigration(sequelize);
    } finally {
        await sequelize.close();
    }
}

const isDirectExecution =
    process.argv[1]?.endsWith("/src/database/migrate.ts")
    || process.argv[1]?.endsWith("\\src\\database\\migrate.ts");

if (process.argv.includes("--undo")) {
    undoLastDatabaseMigration().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
} else if (isDirectExecution) {
    migrateDatabase().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

