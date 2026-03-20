import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createRouter } from "./index";

const TEST_SECRET = "test-secret";

describe("users routes", () => {
    it("POST /users applies validation and reaches handler for valid payload", async () => {
        const createUser = jest.fn(async (_req, res) => {
            res.status(201).json({ id: 1, email: "user@example.com" });
        });

        const app = express();
        app.use(express.json());
        app.use(
            "/",
            createRouter(
                { getSecretKey: () => TEST_SECRET },
                {
                    users: {
                        createUser,
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
                        createAlert: jest.fn(),
                        listAlerts: jest.fn(),
                        getAlertById: jest.fn(),
                        updateAlert: jest.fn(),
                        deleteAlert: jest.fn(),
                    },
                }
            )
        );

        const res = await request(app).post("/users").send({
            email: "user@example.com",
            password: "password123",
            name: "Jane Doe",
        });

        expect(res.status).toBe(201);
        expect(createUser).toHaveBeenCalledTimes(1);
    });

    it("GET /users/:userId returns 401 when auth is missing", async () => {
        const getCurrentUser = jest.fn(async (_req, res) => {
            res.status(200).json({ ok: true });
        });

        const app = express();
        app.use(express.json());
        app.use(
            "/",
            createRouter(
                { getSecretKey: () => TEST_SECRET },
                {
                    users: {
                        createUser: jest.fn(),
                        getCurrentUser,
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
                        createAlert: jest.fn(),
                        listAlerts: jest.fn(),
                        getAlertById: jest.fn(),
                        updateAlert: jest.fn(),
                        deleteAlert: jest.fn(),
                    },
                }
            )
        );

        const res = await request(app).get("/users/1");
        expect(res.status).toBe(401);
        expect(getCurrentUser).not.toHaveBeenCalled();
    });

    it("GET /users/:userId enforces ownership from JWT and reaches handler", async () => {
        const getCurrentUser = jest.fn(async (_req, res) => {
            res.status(200).json({ id: 1, email: "user@example.com" });
        });
        const app = express();
        app.use(express.json());
        app.use(
            "/",
            createRouter(
                { getSecretKey: () => TEST_SECRET },
                {
                    users: {
                        createUser: jest.fn(),
                        getCurrentUser,
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
                        createAlert: jest.fn(),
                        listAlerts: jest.fn(),
                        getAlertById: jest.fn(),
                        updateAlert: jest.fn(),
                        deleteAlert: jest.fn(),
                    },
                }
            )
        );

        const mismatchedToken = jwt.sign({ sub: "2" }, TEST_SECRET, { expiresIn: "1h" });
        const forbiddenRes = await request(app)
            .get("/users/1")
            .set("Authorization", `Bearer ${mismatchedToken}`);
        expect(forbiddenRes.status).toBe(401);
        expect(getCurrentUser).not.toHaveBeenCalled();

        const matchingToken = jwt.sign({ sub: "1" }, TEST_SECRET, { expiresIn: "1h" });
        const okRes = await request(app)
            .get("/users/1")
            .set("Authorization", `Bearer ${matchingToken}`);
        expect(okRes.status).toBe(200);
        expect(getCurrentUser).toHaveBeenCalledTimes(1);
    });
});

