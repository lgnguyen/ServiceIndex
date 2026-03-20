import { createSchemaMigration } from "./001-create-schema";
import { seedReferenceDataMigration } from "./002-seed-reference-data";

export const databaseMigrations = [createSchemaMigration, seedReferenceDataMigration];

