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
            createServiceRecord: jest.fn(),
            listServiceRecords: jest.fn(),
            getServiceRecordById: jest.fn(),
            updateServiceRecord: jest.fn(),
            deleteServiceRecord: jest.fn(),
        },
        alerts: {
            createAlert: jest.fn(async (_req, res) => {
                res.status(201).json({ id: 1 });
            }),
            listAlerts: jest.fn(async (_req, res) => {
                res.status(200).json([]);
            }),
            getAlertById: jest.fn(async (_req, res) => {
                res.status(200).json({ id: 1 });
            }),
            updateAlert: jest.fn(async (_req, res) => {
                res.status(200).json({ id: 1 });
            }),
            deleteAlert: jest.fn(async (_req, res) => {
                res.status(200).send();
            }),
        },
    };
}

describe("alerts routes", () => {
    it("POST /alerts requires auth", async () => {
        const handlers = stubHandlers();
        const app = express();
        app.use(express.json());
        app.use("/", createRouter({ getSecretKey: () => TEST_SECRET }, handlers as any));

        const res = await request(app).post("/alerts").send({
            vehicleId: 1,
            serviceItemId: 1,
            dueDate: "2025-08-01",
            status: "PENDING",
        });
        expect(res.status).toBe(401);
        expect(handlers.alerts.createAlert).not.toHaveBeenCalled();
    });

    it("POST /alerts with JWT reaches handler", async () => {
        const handlers = stubHandlers();
        const app = express();
        app.use(express.json());
        app.use("/", createRouter({ getSecretKey: () => TEST_SECRET }, handlers as any));

        const token = jwt.sign({ sub: "1" }, TEST_SECRET, { expiresIn: "1h" });
        const res = await request(app)
            .post("/alerts")
            .set("Authorization", `Bearer ${token}`)
            .send({
                vehicleId: 1,
                serviceItemId: 1,
                dueDate: "2025-08-01",
                status: "PENDING",
            });

        expect(res.status).toBe(201);
        expect(handlers.alerts.createAlert).toHaveBeenCalledTimes(1);
    });

    it("GET /alerts requires auth", async () => {
        const handlers = stubHandlers();
        const app = express();
        app.use(express.json());
        app.use("/", createRouter({ getSecretKey: () => TEST_SECRET }, handlers as any));

        const res = await request(app).get("/alerts");
        expect(res.status).toBe(401);
        expect(handlers.alerts.listAlerts).not.toHaveBeenCalled();
    });
});
