import type { Request, Response, NextFunction } from "express";
import { sendValidationError } from "./base";

/** POST /alerts: body must have vehicleId, serviceItemId, dueDate, status. */
export function validateCreateAlertBody(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const body = req.body as Record<string, unknown>;
    if (!body || typeof body !== "object") {
        sendValidationError(res, "Request body is required");
        return;
    }
    const vehicleId = body.vehicleId;
    if (vehicleId === undefined || vehicleId === null || String(vehicleId).trim() === "") {
        sendValidationError(res, "Missing or invalid field 'vehicleId'", { field: "vehicleId" });
        return;
    }
    const serviceItemId = body.serviceItemId;
    if (serviceItemId === undefined || serviceItemId === null || String(serviceItemId).trim() === "") {
        sendValidationError(res, "Missing or invalid field 'serviceItemId'", {
            field: "serviceItemId",
        });
        return;
    }
    const dueDate = body.dueDate;
    if (dueDate === undefined || dueDate === null || String(dueDate).trim() === "") {
        sendValidationError(res, "Missing or invalid field 'dueDate'", { field: "dueDate" });
        return;
    }
    const status = body.status;
    if (status === undefined || status === null || String(status).trim() === "") {
        sendValidationError(res, "Missing or invalid field 'status'", { field: "status" });
        return;
    }
    next();
}

/** PUT /alerts/:alertId: body must be object if present. */
export function validateUpdateAlertBody(
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

export function validateAlertIdParam(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const id = req.params.alertId;
    if (!id || String(id).trim() === "") {
        sendValidationError(res, "Missing or invalid path parameter 'alertId'", {
            param: "alertId",
        });
        return;
    }
    next();
}
