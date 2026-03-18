import type { Request, Response, NextFunction } from "express";
import { sendValidationError, sendAuthError } from "./base";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /users: body must have email (valid format), password (non-empty); name optional. */
export function validateCreateUserBody(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const body = req.body as Record<string, unknown>;
    if (!body || typeof body !== "object") {
        sendValidationError(res, "Request body is required");
        return;
    }
    const email = body.email;
    if (email === undefined || email === null || email === "") {
        sendValidationError(res, "Missing or invalid field 'email'", { field: "email" });
        return;
    }
    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
        sendValidationError(res, "Invalid email format", { field: "email" });
        return;
    }
    const password = body.password;
    if (password === undefined || password === null) {
        sendValidationError(res, "Missing field 'password'", { field: "password" });
        return;
    }
    if (typeof password !== "string" || password.length === 0) {
        sendValidationError(res, "Password must be a non-empty string", { field: "password" });
        return;
    }
    next();
}

/** GET /users/:userId (and routes under /users/:userId): require params.userId to match authenticated user. */
export function validateUserIdMatchesAuth(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const userId = req.userId;
    if (!userId) {
        sendAuthError(res, "Authentication required");
        return;
    }
    const paramUserId = req.params.userId;
    if (!paramUserId || paramUserId !== userId) {
        sendAuthError(res, "User id in path does not match authenticated user");
        return;
    }
    next();
}
