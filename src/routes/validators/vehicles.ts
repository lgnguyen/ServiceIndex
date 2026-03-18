import type { Request, Response, NextFunction } from "express";
import { sendValidationError } from "./base";

/** POST /vehicles: body must have nickname, year, makeId, modelId; vin optional. */
export function validateCreateVehicleBody(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const body = req.body as Record<string, unknown>;
    if (!body || typeof body !== "object") {
        sendValidationError(res, "Request body is required");
        return;
    }
    const nickname = body.nickname;
    if (nickname === undefined || nickname === null || String(nickname).trim() === "") {
        sendValidationError(res, "Missing or invalid field 'nickname'", { field: "nickname" });
        return;
    }
    const year = body.year;
    if (year === undefined || year === null) {
        sendValidationError(res, "Missing field 'year'", { field: "year" });
        return;
    }
    const yearNum = Number(year);
    if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2100) {
        sendValidationError(res, "Invalid year", { field: "year" });
        return;
    }
    const makeId = body.makeId;
    if (makeId === undefined || makeId === null || String(makeId).trim() === "") {
        sendValidationError(res, "Missing or invalid field 'makeId'", { field: "makeId" });
        return;
    }
    const modelId = body.modelId;
    if (modelId === undefined || modelId === null || String(modelId).trim() === "") {
        sendValidationError(res, "Missing or invalid field 'modelId'", { field: "modelId" });
        return;
    }
    next();
}

/** PUT /vehicles/:vehicleId: optional body validation (partial update). For now just ensure body is object if present. */
export function validateUpdateVehicleBody(
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

/** Routes with :vehicleId: ensure param is present and non-empty. */
export function validateVehicleIdParam(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const id = req.params.vehicleId;
    if (!id || String(id).trim() === "") {
        sendValidationError(res, "Missing or invalid path parameter 'vehicleId'", {
            param: "vehicleId",
        });
        return;
    }
    next();
}
