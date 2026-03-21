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
            createVehicle: jest.fn(),
            listVehicles: jest.fn(),
            getVehicleById: jest.fn(),
            updateVehicle: jest.fn(),
            deleteVehicle: jest.fn(),
        },
        serviceRecords: {
            createServiceRecord: jest.fn(async (_req, res) => {
                res.status(201).json({ id: 1 });
            }),
            listServiceRecords: jest.fn(async (_req, res) => {
                res.status(200).json([]);
            }),
            getServiceRecordById: jest.fn(async (_req, res) => {
                res.status(200).json({ id: 1 });
            }),
            updateServiceRecord: jest.fn(async (_req, res) => {
                res.status(200).json({ id: 1 });
            }),
            deleteServiceRecord: jest.fn(async (_req, res) => {
                res.status(200).send();
            }),
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

describe("service records routes", () => {
    it("POST /vehicles/:vehicleId/services requires auth", async () => {
        const handlers = stubHandlers();
        const app = express();
        app.use(express.json());
        app.use("/", createRouter({ getSecretKey: () => TEST_SECRET }, handlers as any));

        const res = await request(app).post("/vehicles/1/services").send({
            serviceItemId: 1,
            performedAt: "2025-02-01",
            odometer: 1000,
        });
        expect(res.status).toBe(401);
        expect(handlers.serviceRecords.createServiceRecord).not.toHaveBeenCalled();
    });

    it("POST with JWT reaches handler after validators", async () => {
        const handlers = stubHandlers();
        const app = express();
        app.use(express.json());
        app.use("/", createRouter({ getSecretKey: () => TEST_SECRET }, handlers as any));

        const token = jwt.sign({ sub: "1" }, TEST_SECRET, { expiresIn: "1h" });
        const res = await request(app)
            .post("/vehicles/1/services")
            .set("Authorization", `Bearer ${token}`)
            .send({
                serviceItemId: 1,
                performedAt: "2025-02-01",
                odometer: 1000,
            });

        expect(res.status).toBe(201);
        expect(handlers.serviceRecords.createServiceRecord).toHaveBeenCalledTimes(1);
    });
});
