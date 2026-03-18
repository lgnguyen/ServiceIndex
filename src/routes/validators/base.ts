import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/** Config shape needed for JWT verification (avoids coupling to full Config class). */
export interface AuthConfig {
    getSecretKey(): string;
}

/** Standard validation error shape per API.md. */
export function sendValidationError(
    res: Response,
    message: string,
    details?: Record<string, unknown>
): void {
    res.status(400).json({
        error: {
            code: 400,
            type: "BadRequest",
            message,
            ...(details && { details }),
        },
    });
}

/** Standard auth error for missing/invalid/expired token. */
export function sendAuthError(res: Response, message: string = "Unauthorized"): void {
    res.status(401).json({
        error: {
            code: 401,
            type: "Unauthorized",
            message,
        },
    });
}

/**
 * Middleware factory: require a valid JWT and attach decoded userId to req.userId.
 * If token is missing, invalid, or expired, sends 401 and does not call next().
 */
export function createRequireAuth(config: AuthConfig) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            sendAuthError(res, "Missing or invalid Authorization header");
            return;
        }
        const token = authHeader.slice(7);
        try {
            const secret = config.getSecretKey();
            const decoded = jwt.verify(token, secret) as { sub?: string };
            const userId = decoded.sub ?? (decoded as { userId?: string }).userId;
            if (!userId || typeof userId !== "string") {
                sendAuthError(res, "Invalid token payload");
                return;
            }
            req.userId = userId;
            next();
        } catch {
            sendAuthError(res, "Invalid or expired token");
        }
    };
}

/**
 * Middleware: ensure req.body is a non-null object (for POST/PUT with JSON body).
 * Call after express.json(). Sends 400 if body is missing or not an object.
 */
export function requireJsonBody(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (req.body === undefined || req.body === null) {
        sendValidationError(res, "Request body is required");
        return;
    }
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
        sendValidationError(res, "Request body must be a JSON object");
        return;
    }
    next();
}
