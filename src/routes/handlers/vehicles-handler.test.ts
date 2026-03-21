import type { Request, Response } from "express";
import { VehiclesHandler } from "./vehicles-handler";

function mockRes(): Response {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
}

describe("VehiclesHandler", () => {
    const vehiclesRepo = {
        createVehicle: jest.fn(),
        listByUserId: jest.fn(),
        findById: jest.fn(),
        updateVehicle: jest.fn(),
        deleteById: jest.fn(),
    };
    const makesRepo = { findById: jest.fn() };
    const modelsRepo = { findById: jest.fn() };

    const handler = new VehiclesHandler({
        repositories: {
            vehicles: vehiclesRepo as any,
            makes: makesRepo as any,
            models: modelsRepo as any,
        },
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createVehicle", () => {
        it("returns 401 without userId", async () => {
            const req = { userId: undefined, body: {} } as unknown as Request;
            const res = mockRes();
            await handler.createVehicle(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it("returns 400 when makeId/modelId invalid", async () => {
            const req = {
                userId: "1",
                body: { nickname: "Car", year: 2020, makeId: "x", modelId: "1" },
            } as unknown as Request;
            const res = mockRes();
            await handler.createVehicle(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns 400 when make not found", async () => {
            const req = {
                userId: "1",
                body: { nickname: "Car", year: 2020, makeId: 99, modelId: 1 },
            } as unknown as Request;
            const res = mockRes();
            makesRepo.findById.mockResolvedValue(null);

            await handler.createVehicle(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns 400 when model missing or wrong make", async () => {
            const req = {
                userId: "1",
                body: { nickname: "Car", year: 2020, makeId: 1, modelId: 2 },
            } as unknown as Request;
            const res = mockRes();
            makesRepo.findById.mockResolvedValue({ id: 1 });
            modelsRepo.findById.mockResolvedValue({ id: 2, makeId: 2 });

            await handler.createVehicle(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns 201 with created vehicle", async () => {
            const req = {
                userId: "1",
                body: { nickname: "Car", year: 2020, makeId: 1, modelId: 2, vin: "TESTVIN1" },
            } as unknown as Request;
            const res = mockRes();
            makesRepo.findById.mockResolvedValue({ id: 1 });
            modelsRepo.findById.mockResolvedValue({ id: 2, makeId: 1 });
            vehiclesRepo.createVehicle.mockResolvedValue({
                id: 10,
                uuid: "u10",
                userId: 1,
                nickname: "Car",
                year: 2020,
                makeId: 1,
                modelId: 2,
                vin: "TESTVIN1",
                mileage: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await handler.createVehicle(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(vehiclesRepo.createVehicle).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 1,
                    makeId: 1,
                    modelId: 2,
                    nickname: "Car",
                    year: 2020,
                    vin: "TESTVIN1",
                })
            );
        });
    });

    describe("listVehicles", () => {
        it("returns 200 with array", async () => {
            const req = { params: { userId: "1" } } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.listByUserId.mockResolvedValue([]);

            await handler.listVehicles(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([]);
        });
    });

    describe("getVehicleById", () => {
        it("returns 404 when not found", async () => {
            const req = { userId: "1", params: { vehicleId: "5" } } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue(null);

            await handler.getVehicleById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("returns 401 when not owner", async () => {
            const req = { userId: "1", params: { vehicleId: "5" } } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue({
                id: 5,
                uuid: "v",
                userId: 2,
                nickname: null,
                year: null,
                makeId: null,
                modelId: null,
                vin: null,
                mileage: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await handler.getVehicleById(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it("returns 200 when owner", async () => {
            const req = { userId: "1", params: { vehicleId: "5" } } as unknown as Request;
            const res = mockRes();
            const row = {
                id: 5,
                uuid: "v",
                userId: 1,
                nickname: "Mine",
                year: 2021,
                makeId: 1,
                modelId: 1,
                vin: null,
                mileage: 100,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            vehiclesRepo.findById.mockResolvedValue(row);

            await handler.getVehicleById(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 5, userId: 1 }));
        });
    });

    describe("updateVehicle", () => {
        it("returns 400 for unknown field", async () => {
            const req = {
                userId: "1",
                params: { vehicleId: "1" },
                body: { foo: 1 },
            } as unknown as Request;
            const res = mockRes();

            await handler.updateVehicle(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns 401 when not owner", async () => {
            const req = {
                userId: "1",
                params: { vehicleId: "1" },
                body: { nickname: "X" },
            } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue({
                id: 1,
                uuid: "v",
                userId: 99,
                nickname: "Old",
                year: 2020,
                makeId: 1,
                modelId: 1,
                vin: null,
                mileage: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await handler.updateVehicle(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it("returns 200 after update", async () => {
            const req = {
                userId: "1",
                params: { vehicleId: "1" },
                body: { nickname: "New" },
            } as unknown as Request;
            const res = mockRes();
            const existing = {
                id: 1,
                uuid: "v",
                userId: 1,
                nickname: "Old",
                year: 2020,
                makeId: 1,
                modelId: 1,
                vin: null,
                mileage: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            vehiclesRepo.findById.mockResolvedValue(existing);
            vehiclesRepo.updateVehicle.mockResolvedValue({ ...existing, nickname: "New" });

            await handler.updateVehicle(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe("deleteVehicle", () => {
        it("returns 200 with no body on success", async () => {
            const req = { userId: "1", params: { vehicleId: "3" } } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue({
                id: 3,
                uuid: "v",
                userId: 1,
                nickname: null,
                year: null,
                makeId: null,
                modelId: null,
                vin: null,
                mileage: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await handler.deleteVehicle(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalled();
        });
    });
});
