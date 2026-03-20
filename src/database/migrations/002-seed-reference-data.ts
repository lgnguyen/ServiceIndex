import type { DatabaseMigration } from "./types";

const makes = [
    { id: 1, makeName: "Toyota", metadata: { country: "Japan" } },
    { id: 2, makeName: "Honda", metadata: { country: "Japan" } },
    { id: 3, makeName: "Ford", metadata: { country: "USA" } },
    { id: 4, makeName: "Subaru", metadata: { country: "Japan" } },
];

const models = [
    { makeId: 1, modelName: "RAV4", metadata: { segment: "SUV" } },
    { makeId: 1, modelName: "Camry", metadata: { segment: "Sedan" } },
    { makeId: 2, modelName: "Civic", metadata: { segment: "Sedan" } },
    { makeId: 2, modelName: "CR-V", metadata: { segment: "SUV" } },
    { makeId: 3, modelName: "F-150", metadata: { segment: "Truck" } },
    { makeId: 4, modelName: "Outback", metadata: { segment: "Wagon" } },
];

const serviceItems = [
    { itemType: "Oil Change", recommendedInterval: 5000 },
    { itemType: "Cabin Air Filter", recommendedInterval: 15000 },
    { itemType: "Tire Rotation", recommendedInterval: 6000 },
    { itemType: "Tire Balance", recommendedInterval: 6000 },
    { itemType: "Tire Alignment", recommendedInterval: 12000 },
    { itemType: "Tire Life Inspection", recommendedInterval: 6000 },
    { itemType: "Brake Service", recommendedInterval: 12000 },
    { itemType: "Fluid Service", recommendedInterval: 30000 },
    { itemType: "Spark Plugs", recommendedInterval: 60000 },
    { itemType: "Coil Packs", recommendedInterval: 80000 },
    { itemType: "Clutch Service", recommendedInterval: 75000 },
    { itemType: "Battery", recommendedInterval: 36000 },
    { itemType: "Wipers", recommendedInterval: 12000 },
];

export const seedReferenceDataMigration: DatabaseMigration = {
    name: "002-seed-reference-data",
    async up({ queryInterface }) {
        const now = new Date();

        await queryInterface.bulkInsert(
            "makes",
            makes.map((make) => ({
                ...make,
                metadata: JSON.stringify(make.metadata),
                createdAt: now,
                updatedAt: now,
            }))
        );

        await queryInterface.bulkInsert(
            "models",
            models.map((model) => ({
                ...model,
                metadata: JSON.stringify(model.metadata),
                createdAt: now,
                updatedAt: now,
            }))
        );

        await queryInterface.bulkInsert(
            "service_items",
            serviceItems.map((item) => ({
                ...item,
                createdAt: now,
                updatedAt: now,
            }))
        );
    },
    async down({ queryInterface }) {
        await queryInterface.bulkDelete("service_items", {});
        await queryInterface.bulkDelete("models", {});
        await queryInterface.bulkDelete("makes", {});
    },
};

