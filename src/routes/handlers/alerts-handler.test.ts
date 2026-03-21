import type { Request, Response } from "express";
import { AlertsHandler } from "./alerts-handler";

function mockRes(): Response {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
}

describe("AlertsHandler", () => {
    const alertsRepo = {
        createAlert: jest.fn(),
        listByUserIdPaginated: jest.fn(),
        findById: jest.fn(),
        updateAlert: jest.fn(),
        deleteById: jest.fn(),
    };
    const vehiclesRepo = { findById: jest.fn() };
    const serviceItemsRepo = { findById: jest.fn() };

    const handler = new AlertsHandler({
        repositories: {
            alerts: alertsRepo as any,
            vehicles: vehiclesRepo as any,
            serviceItems: serviceItemsRepo as any,
        },
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createAlert", () => {
        it("returns 401 without auth", async () => {
            const req = {
                userId: undefined,
                body: {
                    vehicleId: 1,
                    serviceItemId: 1,
                    dueDate: "2025-08-01",
                    status: "PENDING",
                },
            } as unknown as Request;
            const res = mockRes();
            await handler.createAlert(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it("returns 404 when vehicle missing", async () => {
            const req = {
                userId: "1",
                body: {
                    vehicleId: 9,
                    serviceItemId: 1,
                    dueDate: "2025-08-01",
                    status: "PENDING",
                },
            } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue(null);

            await handler.createAlert(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("returns 401 when vehicle not owned", async () => {
            const req = {
                userId: "1",
                body: {
                    vehicleId: 9,
                    serviceItemId: 1,
                    dueDate: "2025-08-01",
                    status: "PENDING",
                },
            } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue({ id: 9, userId: 2 });

            await handler.createAlert(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it("returns 404 when service item missing", async () => {
            const req = {
                userId: "1",
                body: {
                    vehicleId: 9,
                    serviceItemId: 999,
                    dueDate: "2025-08-01",
                    status: "PENDING",
                },
            } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue({ id: 9, userId: 1 });
            serviceItemsRepo.findById.mockResolvedValue(null);

            await handler.createAlert(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("returns 201 on success", async () => {
            const req = {
                userId: "1",
                body: {
                    vehicleId: 9,
                    serviceItemId: 1,
                    dueDate: "2025-08-01",
                    status: "PENDING",
                    message: "Oil soon",
                },
            } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue({ id: 9, userId: 1 });
            serviceItemsRepo.findById.mockResolvedValue({ id: 1 });
            const created = {
                id: 50,
                userId: 1,
                vehicleId: 9,
                serviceItemId: 1,
                dueDate: new Date("2025-08-01"),
                status: "PENDING",
                message: "Oil soon",
                acknowledged: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            alertsRepo.createAlert.mockResolvedValue(created);

            await handler.createAlert(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(alertsRepo.createAlert).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 1,
                    vehicleId: 9,
                    serviceItemId: 1,
                    status: "PENDING",
                    message: "Oil soon",
                    acknowledged: false,
                })
            );
        });
    });

    describe("listAlerts", () => {
        it("returns 400 for bad pagination", async () => {
            const req = { userId: "1", query: { limit: "200" } } as unknown as Request;
            const res = mockRes();
            await handler.listAlerts(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns 200 with alerts", async () => {
            const req = { userId: "1", query: {} } as unknown as Request;
            const res = mockRes();
            alertsRepo.listByUserIdPaginated.mockResolvedValue([]);

            await handler.listAlerts(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe("getAlertById", () => {
        it("returns 404 when missing", async () => {
            const req = { userId: "1", params: { alertId: "1" } } as unknown as Request;
            const res = mockRes();
            alertsRepo.findById.mockResolvedValue(null);

            await handler.getAlertById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("returns 401 when wrong user", async () => {
            const req = { userId: "1", params: { alertId: "1" } } as unknown as Request;
            const res = mockRes();
            alertsRepo.findById.mockResolvedValue({
                id: 1,
                userId: 2,
                vehicleId: 1,
                serviceItemId: 1,
                dueDate: null,
                status: "PENDING",
                message: null,
                acknowledged: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await handler.getAlertById(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe("updateAlert", () => {
        it("returns 400 for unknown field", async () => {
            const req = {
                userId: "1",
                params: { alertId: "1" },
                body: { vehicleId: 9 },
            } as unknown as Request;
            const res = mockRes();

            await handler.updateAlert(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe("deleteAlert", () => {
        it("deletes when owner", async () => {
            const req = { userId: "1", params: { alertId: "3" } } as unknown as Request;
            const res = mockRes();
            alertsRepo.findById.mockResolvedValue({
                id: 3,
                userId: 1,
                vehicleId: 1,
                serviceItemId: 1,
                dueDate: null,
                status: "PENDING",
                message: null,
                acknowledged: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await handler.deleteAlert(req, res);
            expect(alertsRepo.deleteById).toHaveBeenCalledWith(3);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
