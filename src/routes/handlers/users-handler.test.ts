import type { Request, Response } from "express";
import { UniqueConstraintError } from "sequelize";
import { UsersHandler } from "./users-handler";

function mockRes(): Response {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;
}

describe("UsersHandler", () => {
    const usersRepo = {
        createUser: jest.fn(),
        findById: jest.fn(),
    };
    const handler = new UsersHandler({
        repositories: {
            users: usersRepo as any,
        },
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("createUser returns 201 and excludes password hash", async () => {
        const req = {
            body: {
                email: "user@example.com",
                password: "my-password",
                name: "Jane Doe",
            },
        } as unknown as Request;
        const res = mockRes();
        usersRepo.createUser.mockResolvedValue({
            id: 1,
            uuid: "uuid-1",
            email: "user@example.com",
            passwordHash: "hidden",
            name: "Jane Doe",
            location: null,
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        });

        await handler.createUser(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 1,
                uuid: "uuid-1",
                email: "user@example.com",
                name: "Jane Doe",
            })
        );
        expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({ passwordHash: "hidden" }));
    });

    it("createUser returns 409 on duplicate email", async () => {
        const req = {
            body: {
                email: "user@example.com",
                password: "my-password",
            },
        } as unknown as Request;
        const res = mockRes();
        usersRepo.createUser.mockRejectedValue(new UniqueConstraintError({}));

        await handler.createUser(req, res);
        expect(res.status).toHaveBeenCalledWith(409);
    });

    it("getCurrentUser returns 404 when user not found", async () => {
        const req = { params: { userId: "123" } } as unknown as Request;
        const res = mockRes();
        usersRepo.findById.mockResolvedValue(null);

        await handler.getCurrentUser(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("getCurrentUser returns 200 with user profile", async () => {
        const req = { params: { userId: "123" } } as unknown as Request;
        const res = mockRes();
        usersRepo.findById.mockResolvedValue({
            id: 123,
            uuid: "uuid-123",
            email: "person@example.com",
            passwordHash: "hash",
            name: "Person",
            location: "Seattle",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        });

        await handler.getCurrentUser(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 123,
                email: "person@example.com",
                name: "Person",
                location: "Seattle",
            })
        );
    });

    it("getCurrentUser returns 400 for invalid userId path param", async () => {
        const req = { params: { userId: "abc" } } as unknown as Request;
        const res = mockRes();

        await handler.getCurrentUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
