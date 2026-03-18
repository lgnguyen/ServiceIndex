import type { Request, Response, NextFunction } from "express";
import { sendValidationError } from "./base";

/** POST /vehicles/:vehicleId/services: body must have serviceItemId, performedAt, odometer; notes optional. */
export function validateCreateServiceRecordBody(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const body = req.body as Record<string, unknown>;
    if (!body || typeof body !== "object") {
        sendValidationError(res, "Request body is required");
        return;
    }
    const serviceItemId = body.serviceItemId;
    if (serviceItemId === undefined || serviceItemId === null || String(serviceItemId).trim() === "") {
        sendValidationError(res, "Missing or invalid field 'serviceItemId'", {
            field: "serviceItemId",
        });
        return;
    }
    const performedAt = body.performedAt;
    if (performedAt === undefined || performedAt === null || String(performedAt).trim() === "") {
        sendValidationError(res, "Missing or invalid field 'performedAt'", { field: "performedAt" });
        return;
    }
    const odometer = body.odometer;
    if (odometer === undefined || odometer === null) {
        sendValidationError(res, "Missing field 'odometer'", { field: "odometer" });
        return;
    }
    const odometerNum = Number(odometer);
    if (!Number.isInteger(odometerNum) || odometerNum < 0) {
        sendValidationError(res, "Invalid odometer value", { field: "odometer" });
        return;
    }
    next();
}

/** PUT .../services/:serviceRecordId: body must be object if present. */
export function validateUpdateServiceRecordBody(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (req.body !== undefined && (typeof req.body !== "object" || Array.isArray(req.body))) {
        sendValidationError(res, "Request body must be a JSON object");
        return;
    }
    next();
}

export function validateServiceRecordIdParam(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const id = req.params.serviceRecordId;
    if (!id || String(id).trim() === "") {
        sendValidationError(res, "Missing or invalid path parameter 'serviceRecordId'", {
            param: "serviceRecordId",
        });
        return;
    }
    next();
}
