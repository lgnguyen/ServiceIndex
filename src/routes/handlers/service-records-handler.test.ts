import type { Request, Response } from "express";
import { ServiceRecordsHandler } from "./service-records-handler";

function mockRes(): Response {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    } as unknown as Response;
}

describe("ServiceRecordsHandler", () => {
    const serviceRecordsRepo = {
        createServiceRecord: jest.fn(),
        listByVehicleIdPaginated: jest.fn(),
        findById: jest.fn(),
        updateServiceRecord: jest.fn(),
        deleteById: jest.fn(),
    };
    const vehiclesRepo = { findById: jest.fn() };
    const serviceItemsRepo = { findById: jest.fn() };

    const handler = new ServiceRecordsHandler({
        repositories: {
            serviceRecords: serviceRecordsRepo as any,
            vehicles: vehiclesRepo as any,
            serviceItems: serviceItemsRepo as any,
        },
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createServiceRecord", () => {
        it("returns 401 without auth user", async () => {
            const req = {
                userId: undefined,
                params: { vehicleId: "1" },
                body: {
                    serviceItemId: 1,
                    performedAt: "2025-02-01",
                    odometer: 1000,
                },
            } as unknown as Request;
            const res = mockRes();
            await handler.createServiceRecord(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it("returns 404 when vehicle missing", async () => {
            const req = {
                userId: "1",
                params: { vehicleId: "9" },
                body: {
                    serviceItemId: 1,
                    performedAt: "2025-02-01",
                    odometer: 1000,
                },
            } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue(null);

            await handler.createServiceRecord(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("returns 401 when vehicle owned by another user", async () => {
            const req = {
                userId: "1",
                params: { vehicleId: "9" },
                body: {
                    serviceItemId: 1,
                    performedAt: "2025-02-01",
                    odometer: 1000,
                },
            } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue({ id: 9, userId: 2 });

            await handler.createServiceRecord(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it("returns 404 when service item missing", async () => {
            const req = {
                userId: "1",
                params: { vehicleId: "9" },
                body: {
                    serviceItemId: 99,
                    performedAt: "2025-02-01",
                    odometer: 1000,
                },
            } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue({ id: 9, userId: 1 });
            serviceItemsRepo.findById.mockResolvedValue(null);

            await handler.createServiceRecord(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("returns 201 on success", async () => {
            const req = {
                userId: "1",
                params: { vehicleId: "9" },
                body: {
                    serviceItemId: 1,
                    performedAt: "2025-02-01",
                    odometer: 45000,
                    notes: "Oil",
                },
            } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue({ id: 9, userId: 1 });
            serviceItemsRepo.findById.mockResolvedValue({ id: 1 });
            const created = {
                id: 100,
                uuid: "u",
                vehicleId: 9,
                serviceItemId: 1,
                performedAt: new Date("2025-02-01"),
                odometer: 45000,
                notes: "Oil",
                serviceLocation: null,
                productName: null,
                cost: null,
                interval: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            serviceRecordsRepo.createServiceRecord.mockResolvedValue(created);

            await handler.createServiceRecord(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(serviceRecordsRepo.createServiceRecord).toHaveBeenCalledWith(
                expect.objectContaining({
                    vehicleId: 9,
                    serviceItemId: 1,
                    odometer: 45000,
                    notes: "Oil",
                })
            );
        });
    });

    describe("listServiceRecords", () => {
        it("returns 400 for invalid pagination", async () => {
            const req = {
                userId: "1",
                params: { vehicleId: "1" },
                query: { limit: "999" },
            } as unknown as Request;
            const res = mockRes();

            await handler.listServiceRecords(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("returns 200 with paginated list", async () => {
            const req = {
                userId: "1",
                params: { vehicleId: "1" },
                query: { limit: "10", offset: "0" },
            } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue({ id: 1, userId: 1 });
            serviceRecordsRepo.listByVehicleIdPaginated.mockResolvedValue([]);

            await handler.listServiceRecords(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(serviceRecordsRepo.listByVehicleIdPaginated).toHaveBeenCalledWith(1, {
                limit: 10,
                offset: 0,
            });
        });
    });

    describe("getServiceRecordById", () => {
        it("returns 404 when record on different vehicle", async () => {
            const req = {
                userId: "1",
                params: { vehicleId: "1", serviceRecordId: "5" },
            } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue({ id: 1, userId: 1 });
            serviceRecordsRepo.findById.mockResolvedValue({
                id: 5,
                vehicleId: 2,
                uuid: "x",
                serviceItemId: 1,
                performedAt: null,
                odometer: null,
                notes: null,
                serviceLocation: null,
                productName: null,
                cost: null,
                interval: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await handler.getServiceRecordById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("updateServiceRecord", () => {
        it("returns 400 for unknown field", async () => {
            const req = {
                userId: "1",
                params: { vehicleId: "1", serviceRecordId: "5" },
                body: { serviceItemId: 9 },
            } as unknown as Request;
            const res = mockRes();

            await handler.updateServiceRecord(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe("deleteServiceRecord", () => {
        it("calls deleteById when record belongs to vehicle", async () => {
            const req = {
                userId: "1",
                params: { vehicleId: "1", serviceRecordId: "5" },
            } as unknown as Request;
            const res = mockRes();
            vehiclesRepo.findById.mockResolvedValue({ id: 1, userId: 1 });
            serviceRecordsRepo.findById.mockResolvedValue({
                id: 5,
                vehicleId: 1,
                uuid: "x",
                serviceItemId: 1,
                performedAt: null,
                odometer: null,
                notes: null,
                serviceLocation: null,
                productName: null,
                cost: null,
                interval: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await handler.deleteServiceRecord(req, res);
            expect(serviceRecordsRepo.deleteById).toHaveBeenCalledWith(5);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
