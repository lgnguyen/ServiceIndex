import type { Request, Response } from "express";
import { UsersHandler } from "./users-handler";

function mockRes(): Response {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;
}

describe("UsersHandler", () => {
    const handler = new UsersHandler();
    const req = {} as Request;

    it("createUser returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.createUser(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });

    it("getCurrentUser returns 501 and Not implemented", () => {
        const res = mockRes();
        handler.getCurrentUser(req, res);
        expect(res.status).toHaveBeenCalledWith(501);
        expect(res.json).toHaveBeenCalledWith({ message: "Not implemented" });
    });
});
