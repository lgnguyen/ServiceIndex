import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createRouter } from "./index";

const TEST_SECRET = "test-secret";

function stubHandlers() {
    return {
        users: {
            createUser: jest.fn(),
            getCurrentUser: jest.fn(),
        },
        vehicles: {
            createVehicle: jest.fn(async (_req, res) => {
                res.status(201).json({ id: 1 });
            }),
            listVehicles: jest.fn(async (_req, res) => {
                res.status(200).json([]);
            }),
            getVehicleById: jest.fn(async (_req, res) => {
                res.status(200).json({ id: 1 });
            }),
            updateVehicle: jest.fn(async (_req, res) => {
                res.status(200).json({ id: 1 });
            }),
            deleteVehicle: jest.fn(async (_req, res) => {
                res.status(200).send();
            }),
        },
        serviceRecords: {
            createServiceRecord: jest.fn(),
            listServiceRecords: jest.fn(),
            getServiceRecordById: jest.fn(),
            updateServiceRecord: jest.fn(),
            deleteServiceRecord: jest.fn(),
        },
        alerts: {
            createAlert: jest.fn(),
            listAlerts: jest.fn(),
            getAlertById: jest.fn(),
            updateAlert: jest.fn(),
            deleteAlert: jest.fn(),
        },
    };
}

describe("vehicles routes", () => {
    it("POST /vehicles requires auth", async () => {
        const handlers = stubHandlers();
        const app = express();
        app.use(express.json());
        app.use("/", createRouter({ getSecretKey: () => TEST_SECRET }, handlers as any));

        const res = await request(app).post("/vehicles").send({
            nickname: "SUV",
            year: 2020,
            makeId: 1,
            modelId: 1,
        });
        expect(res.status).toBe(401);
        expect(handlers.vehicles.createVehicle).not.toHaveBeenCalled();
    });

    it("POST /vehicles with valid body and JWT reaches handler", async () => {
        const handlers = stubHandlers();
        const app = express();
        app.use(express.json());
        app.use("/", createRouter({ getSecretKey: () => TEST_SECRET }, handlers as any));

        const token = jwt.sign({ sub: "1" }, TEST_SECRET, { expiresIn: "1h" });
        const res = await request(app)
            .post("/vehicles")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nickname: "SUV",
                year: 2020,
                makeId: 1,
                modelId: 1,
            });

        expect(res.status).toBe(201);
        expect(handlers.vehicles.createVehicle).toHaveBeenCalledTimes(1);
    });

    it("GET /users/:userId/vehicles enforces JWT ownership", async () => {
        const handlers = stubHandlers();
        const app = express();
        app.use(express.json());
        app.use("/", createRouter({ getSecretKey: () => TEST_SECRET }, handlers as any));

        const token = jwt.sign({ sub: "2" }, TEST_SECRET, { expiresIn: "1h" });
        const forbidden = await request(app)
            .get("/users/1/vehicles")
            .set("Authorization", `Bearer ${token}`);
        expect(forbidden.status).toBe(401);
        expect(handlers.vehicles.listVehicles).not.toHaveBeenCalled();

        const okToken = jwt.sign({ sub: "1" }, TEST_SECRET, { expiresIn: "1h" });
        const ok = await request(app)
            .get("/users/1/vehicles")
            .set("Authorization", `Bearer ${okToken}`);
        expect(ok.status).toBe(200);
        expect(handlers.vehicles.listVehicles).toHaveBeenCalledTimes(1);
    });

    it("GET /vehicles/:vehicleId requires auth", async () => {
        const handlers = stubHandlers();
        const app = express();
        app.use(express.json());
        app.use("/", createRouter({ getSecretKey: () => TEST_SECRET }, handlers as any));

        const res = await request(app).get("/vehicles/5");
        expect(res.status).toBe(401);
        expect(handlers.vehicles.getVehicleById).not.toHaveBeenCalled();
    });
});
