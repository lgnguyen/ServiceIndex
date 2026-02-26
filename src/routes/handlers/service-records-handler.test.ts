import type { Request, Response } from "express";
import { ServiceRecordsHandler } from "./service-records-handler";

function mockRes(): Response {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;
}

describe("ServiceRecordsHandler", () => {
    const handler = new ServiceRecordsHandler();
    const req = {} as Request;

    it("createServiceRecord returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.createServiceRecord(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });

    it("listServiceRecords returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.listServiceRecords(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });

    it("getServiceRecordById returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.getServiceRecordById(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });

    it("updateServiceRecord returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.updateServiceRecord(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });

    it("deleteServiceRecord returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.deleteServiceRecord(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });
});
