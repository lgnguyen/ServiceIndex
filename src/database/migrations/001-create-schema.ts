import type { DatabaseMigration } from "./types";

export const createSchemaMigration: DatabaseMigration = {
    name: "001-create-schema",
    async up({ queryInterface, dataTypes }) {
        await queryInterface.createTable("users", {
            id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
            uuid: { type: dataTypes.STRING, allowNull: false, unique: true },
            email: { type: dataTypes.STRING, allowNull: false, unique: true },
            passwordHash: { type: dataTypes.STRING, allowNull: false },
            name: { type: dataTypes.STRING, allowNull: true },
            location: { type: dataTypes.STRING, allowNull: true },
            createdAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
            updatedAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
        });

        await queryInterface.createTable("makes", {
            id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
            makeName: { type: dataTypes.STRING, allowNull: false, unique: true },
            metadata: { type: dataTypes.JSON, allowNull: true },
            createdAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
            updatedAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
        });

        await queryInterface.createTable("service_items", {
            id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
            itemType: { type: dataTypes.STRING, allowNull: false, unique: true },
            recommendedInterval: { type: dataTypes.INTEGER, allowNull: true },
            createdAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
            updatedAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
        });

        await queryInterface.createTable("models", {
            id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
            makeId: {
                type: dataTypes.INTEGER,
                allowNull: false,
                references: { model: "makes", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            modelName: { type: dataTypes.STRING, allowNull: false },
            metadata: { type: dataTypes.JSON, allowNull: true },
            createdAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
            updatedAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
        });
        await queryInterface.addIndex("models", ["makeId", "modelName"], {
            unique: true,
            name: "models_make_id_model_name_unique",
        });

        await queryInterface.createTable("vehicles", {
            id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
            uuid: { type: dataTypes.STRING, allowNull: false, unique: true },
            userId: {
                type: dataTypes.INTEGER,
                allowNull: false,
                references: { model: "users", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            nickname: { type: dataTypes.STRING, allowNull: true },
            year: { type: dataTypes.INTEGER, allowNull: true },
            makeId: {
                type: dataTypes.INTEGER,
                allowNull: true,
                references: { model: "makes", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            modelId: {
                type: dataTypes.INTEGER,
                allowNull: true,
                references: { model: "models", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            vin: { type: dataTypes.STRING, allowNull: true },
            mileage: { type: dataTypes.INTEGER, allowNull: true },
            createdAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
            updatedAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
        });
        await queryInterface.addIndex("vehicles", ["userId"], { name: "vehicles_user_id_idx" });

        await queryInterface.createTable("service_records", {
            id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
            uuid: { type: dataTypes.STRING, allowNull: false, unique: true },
            vehicleId: {
                type: dataTypes.INTEGER,
                allowNull: false,
                references: { model: "vehicles", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            serviceItemId: {
                type: dataTypes.INTEGER,
                allowNull: false,
                references: { model: "service_items", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },
            performedAt: { type: dataTypes.DATE, allowNull: true },
            odometer: { type: dataTypes.INTEGER, allowNull: true },
            notes: { type: dataTypes.TEXT, allowNull: true },
            serviceLocation: { type: dataTypes.STRING, allowNull: true },
            productName: { type: dataTypes.STRING, allowNull: true },
            cost: { type: dataTypes.DECIMAL(10, 2), allowNull: true },
            interval: { type: dataTypes.INTEGER, allowNull: true },
            createdAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
            updatedAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
        });
        await queryInterface.addIndex("service_records", ["vehicleId"], {
            name: "service_records_vehicle_id_idx",
        });

        await queryInterface.createTable("alerts", {
            id: { type: dataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
            userId: {
                type: dataTypes.INTEGER,
                allowNull: false,
                references: { model: "users", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            vehicleId: {
                type: dataTypes.INTEGER,
                allowNull: false,
                references: { model: "vehicles", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            serviceItemId: {
                type: dataTypes.INTEGER,
                allowNull: true,
                references: { model: "service_items", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            dueDate: { type: dataTypes.DATE, allowNull: true },
            status: { type: dataTypes.STRING, allowNull: false, defaultValue: "PENDING" },
            message: { type: dataTypes.TEXT, allowNull: true },
            acknowledged: { type: dataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            createdAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
            updatedAt: { type: dataTypes.DATE, allowNull: false, defaultValue: dataTypes.NOW },
        });
        await queryInterface.addIndex("alerts", ["userId"], { name: "alerts_user_id_idx" });
        await queryInterface.addIndex("alerts", ["vehicleId"], { name: "alerts_vehicle_id_idx" });
    },
    async down({ queryInterface }) {
        await queryInterface.dropTable("alerts");
        await queryInterface.dropTable("service_records");
        await queryInterface.dropTable("vehicles");
        await queryInterface.dropTable("models");
        await queryInterface.dropTable("service_items");
        await queryInterface.dropTable("makes");
        await queryInterface.dropTable("users");
    },
};

