import type { Request, Response } from "express";
import { AlertsHandler } from "./alerts-handler";

function mockRes(): Response {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;
}

describe("AlertsHandler", () => {
    const handler = new AlertsHandler();
    const req = {} as Request;

    it("createAlert returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.createAlert(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });

    it("listAlerts returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.listAlerts(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });

    it("getAlertById returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.getAlertById(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });

    it("updateAlert returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.updateAlert(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });

    it("deleteAlert returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.deleteAlert(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });
});
