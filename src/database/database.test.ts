import { Config } from "../common/config";
import { createSequelize } from "./index";
import {
    Alert,
    Make,
    ModelEntity,
    ServiceItem,
    ServiceRecord,
    User,
    Vehicle,
    initModels,
} from "./models";
import {
    AlertRepository,
    MakeRepository,
    ModelRepository,
    ServiceItemRepository,
    ServiceRecordRepository,
    UserRepository,
    VehicleRepository,
} from "./repositories";

function makeEnv(overrides: Record<string, string> = {}): NodeJS.ProcessEnv {
    return {
        SECRET_KEY: "test-secret",
        PORT: "8000",
        NODE_ENV: "test",
        DATABASE_PATH: ":memory:",
        ...overrides,
    };
}

describe("database", () => {
    const config = new Config(makeEnv());
    const sequelize = createSequelize(config);

    beforeAll(async () => {
        initModels(sequelize);
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it("connects to sqlite and initializes all models", async () => {
        await expect(sequelize.authenticate()).resolves.toBeUndefined();

        const tables = await sequelize.getQueryInterface().showAllTables();
        expect(tables).toEqual(
            expect.arrayContaining([
                "users",
                "vehicles",
                "service_records",
                "service_items",
                "makes",
                "models",
                "alerts",
            ])
        );
    });

    it("supports repository CRUD and lookup operations", async () => {
        const userRepo = new UserRepository(User);
        const vehicleRepo = new VehicleRepository(Vehicle);
        const serviceRecordRepo = new ServiceRecordRepository(ServiceRecord);
        const serviceItemRepo = new ServiceItemRepository(ServiceItem);
        const makeRepo = new MakeRepository(Make);
        const modelRepo = new ModelRepository(ModelEntity);
        const alertRepo = new AlertRepository(Alert);

        const make = await makeRepo.createMake({ name: "Honda" });
        const model = await modelRepo.createModel({ makeId: make.id, name: "Civic" });
        const serviceItem = await serviceItemRepo.createServiceItem({ name: "Oil Change" });
        const user = await userRepo.createUser({
            email: "alice@example.com",
            passwordHash: "hashed-password",
            name: "Alice",
        });
        const vehicle = await vehicleRepo.createVehicle({
            userId: user.id,
            nickname: "Daily Driver",
            year: 2020,
            makeId: make.id,
            modelId: model.id,
        });
        const serviceRecord = await serviceRecordRepo.createServiceRecord({
            vehicleId: vehicle.id,
            serviceItemId: serviceItem.id,
            performedAt: new Date("2026-01-01T00:00:00.000Z"),
            odometer: 12000,
            notes: "Initial service",
        });
        const alert = await alertRepo.createAlert({
            userId: user.id,
            vehicleId: vehicle.id,
            serviceItemId: serviceItem.id,
            dueDate: new Date("2026-06-01T00:00:00.000Z"),
            status: "open",
        });

        expect((await userRepo.findByEmail("alice@example.com"))?.id).toBe(user.id);
        expect((await userRepo.listUsers()).map((item) => item.email)).toEqual(["alice@example.com"]);

        const updatedUser = await userRepo.updateUser(user.id, { name: "Alicia" });
        expect(updatedUser?.name).toBe("Alicia");

        expect((await vehicleRepo.listByUserId(user.id)).map((item) => item.id)).toEqual([vehicle.id]);
        const updatedVehicle = await vehicleRepo.updateVehicle(vehicle.id, {
            nickname: "Weekend Car",
        });
        expect(updatedVehicle?.nickname).toBe("Weekend Car");

        expect((await serviceRecordRepo.listByVehicleId(vehicle.id)).map((item) => item.id)).toEqual([
            serviceRecord.id,
        ]);
        const updatedServiceRecord = await serviceRecordRepo.updateServiceRecord(serviceRecord.id, {
            notes: "Updated service note",
        });
        expect(updatedServiceRecord?.notes).toBe("Updated service note");

        expect((await serviceItemRepo.findByName("Oil Change"))?.id).toBe(serviceItem.id);
        expect((await serviceItemRepo.listServiceItems()).map((item) => item.name)).toEqual([
            "Oil Change",
        ]);

        expect((await makeRepo.findByName("Honda"))?.id).toBe(make.id);
        expect((await makeRepo.listMakes()).map((item) => item.name)).toEqual(["Honda"]);

        expect((await modelRepo.findByNameAndMakeId("Civic", make.id))?.id).toBe(model.id);
        expect((await modelRepo.listByMakeId(make.id)).map((item) => item.name)).toEqual(["Civic"]);

        expect((await alertRepo.listByUserId(user.id)).map((item) => item.id)).toEqual([alert.id]);
        const updatedAlert = await alertRepo.updateAlert(alert.id, { status: "dismissed" });
        expect(updatedAlert?.status).toBe("dismissed");

        const extraMake = await makeRepo.createMake({ name: "Toyota" });
        const extraModel = await modelRepo.createModel({ makeId: extraMake.id, name: "Camry" });
        const extraServiceItem = await serviceItemRepo.createServiceItem({ name: "Brake Service" });
        const extraUser = await userRepo.createUser({
            email: "bob@example.com",
            passwordHash: "other-password",
            name: "Bob",
        });
        const extraVehicle = await vehicleRepo.createVehicle({
            userId: extraUser.id,
            nickname: "Backup Car",
            year: 2015,
            makeId: extraMake.id,
            modelId: extraModel.id,
        });
        const extraServiceRecord = await serviceRecordRepo.createServiceRecord({
            vehicleId: extraVehicle.id,
            serviceItemId: extraServiceItem.id,
            performedAt: new Date("2026-02-01T00:00:00.000Z"),
            odometer: 45000,
            notes: "Secondary service",
        });
        const extraAlert = await alertRepo.createAlert({
            userId: extraUser.id,
            vehicleId: extraVehicle.id,
            serviceItemId: extraServiceItem.id,
            dueDate: new Date("2026-08-01T00:00:00.000Z"),
            status: "open",
        });

        await expect(alertRepo.deleteById(extraAlert.id)).resolves.toBe(true);
        await expect(serviceRecordRepo.deleteById(extraServiceRecord.id)).resolves.toBe(true);
        await expect(vehicleRepo.deleteById(extraVehicle.id)).resolves.toBe(true);
        await expect(userRepo.deleteById(extraUser.id)).resolves.toBe(true);
        await expect(modelRepo.deleteById(extraModel.id)).resolves.toBe(true);
        await expect(serviceItemRepo.deleteById(extraServiceItem.id)).resolves.toBe(true);
        await expect(makeRepo.deleteById(extraMake.id)).resolves.toBe(true);
    });

    it("allows repositories to be passed into consumers via injection", async () => {
        const userRepo = new UserRepository(User);
        const vehicleRepo = new VehicleRepository(Vehicle);

        class GarageConsumer {
            constructor(
                public readonly users: UserRepository,
                public readonly vehicles: VehicleRepository
            ) {}

            async listVehiclesForUser(userId: number) {
                return this.vehicles.listByUserId(userId);
            }
        }

        const consumer = new GarageConsumer(userRepo, vehicleRepo);
        const user = await userRepo.createUser({
            email: "inject@example.com",
            passwordHash: "hash",
            name: "Inject Test",
        });
        await vehicleRepo.createVehicle({
            userId: user.id,
            nickname: "Injected Vehicle",
            year: 2024,
            makeId: null,
            modelId: null,
        });

        expect(consumer.users).toBe(userRepo);
        await expect(consumer.listVehiclesForUser(user.id)).resolves.toHaveLength(1);
    });
});

