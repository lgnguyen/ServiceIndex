import type { Request, Response } from "express";

/** Placeholder until validators and business logic (Step 7). */
const NOT_IMPLEMENTED = { message: "Not implemented" };

export class UsersHandler {
    /** POST /users — create user. Will delegate to validator then business logic. */
    createUser(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }

    /** GET /users/:userId — get current user. Will delegate to validator then business logic. */
    getCurrentUser(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }
}
