import type { Request, Response } from "express";
import { VehiclesHandler } from "./vehicles-handler";

function mockRes(): Response {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;
}

describe("VehiclesHandler", () => {
    const handler = new VehiclesHandler();
    const req = {} as Request;

    it("createVehicle returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.createVehicle(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });

    it("listVehicles returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.listVehicles(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });

    it("getVehicleById returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.getVehicleById(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });

    it("updateVehicle returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.updateVehicle(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });

    it("deleteVehicle returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.deleteVehicle(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });
});
