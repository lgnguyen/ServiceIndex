import { DataTypes } from "sequelize";
import type { QueryInterface, Sequelize } from "sequelize";

export interface MigrationContext {
    queryInterface: QueryInterface;
    sequelize: Sequelize;
    dataTypes: typeof DataTypes;
}

export interface DatabaseMigration {
    name: string;
    up(context: MigrationContext): Promise<void>;
    down(context: MigrationContext): Promise<void>;
}

