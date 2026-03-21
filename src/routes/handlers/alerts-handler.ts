import type { Request, Response } from "express";
import type { AuthConfig } from "../validators";
import type { AlertRepository, ServiceItemRepository, VehicleRepository } from "../../database/repositories";
import type { Alert } from "../../database/models";

const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 100;

interface AlertResponse {
    id: number;
    userId: number;
    vehicleId: number;
    serviceItemId: number | null;
    dueDate: Date | null;
    status: string;
    message: string | null;
    acknowledged: boolean;
    createdAt: Date;
    updatedAt: Date;
}

function sanitizeAlert(row: Alert): AlertResponse {
    return {
        id: row.id,
        userId: row.userId,
        vehicleId: row.vehicleId,
        serviceItemId: row.serviceItemId,
        dueDate: row.dueDate,
        status: row.status,
        message: row.message,
        acknowledged: row.acknowledged,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

function parsePositiveInt(value: unknown): number | null {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) return null;
    return n;
}

function authUserId(req: Request): number | null {
    const raw = req.userId;
    if (raw === undefined || raw === null || raw === "") return null;
    return parsePositiveInt(raw);
}

function parseDueDate(value: unknown): Date | null {
    if (value === undefined || value === null) return null;
    const s = String(value).trim();
    if (s === "") return null;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return d;
}

function parsePaginationQuery(req: Request): { limit: number; offset: number } | null {
    const rawLimit = req.query.limit;
    const rawOffset = req.query.offset;
    const limit =
        rawLimit === undefined || rawLimit === ""
            ? DEFAULT_PAGE_LIMIT
            : Number(rawLimit);
    const offset =
        rawOffset === undefined || rawOffset === "" ? 0 : Number(rawOffset);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_LIMIT) {
        return null;
    }
    if (!Number.isInteger(offset) || offset < 0) {
        return null;
    }
    return { limit, offset };
}

export class AlertsHandler {
    constructor(
        private readonly deps?: {
            config?: AuthConfig;
            repositories?: {
                alerts?: AlertRepository;
                vehicles?: VehicleRepository;
                serviceItems?: ServiceItemRepository;
            };
        }
    ) {}

    private get alertsRepo(): AlertRepository {
        const r = this.deps?.repositories?.alerts;
        if (!r) throw new Error("AlertRepository is not configured");
        return r;
    }

    private get vehiclesRepo(): VehicleRepository {
        const r = this.deps?.repositories?.vehicles;
        if (!r) throw new Error("VehicleRepository is not configured");
        return r;
    }

    private get serviceItemsRepo(): ServiceItemRepository {
        const r = this.deps?.repositories?.serviceItems;
        if (!r) throw new Error("ServiceItemRepository is not configured");
        return r;
    }

    private async loadOwnedVehicle(
        res: Response,
        vehicleId: number,
        ownerId: number | null
    ): Promise<{ id: number; userId: number } | null> {
        if (ownerId === null) {
            res.status(401).json({
                error: { code: 401, type: "Unauthorized", message: "Authentication required" },
            });
            return null;
        }
        const vehicle = await this.vehiclesRepo.findById(vehicleId);
        if (!vehicle) {
            res.status(404).json({
                error: { code: 404, type: "NotFound", message: "Vehicle not found" },
            });
            return null;
        }
        if (vehicle.userId !== ownerId) {
            res.status(401).json({
                error: {
                    code: 401,
                    type: "Unauthorized",
                    message: "Vehicle does not belong to authenticated user",
                },
            });
            return null;
        }
        return { id: vehicle.id, userId: vehicle.userId };
    }

    /** POST /alerts */
    async createAlert(req: Request, res: Response): Promise<void> {
        const ownerId = authUserId(req);
        if (ownerId === null) {
            res.status(401).json({
                error: { code: 401, type: "Unauthorized", message: "Authentication required" },
            });
            return;
        }

        const body = req.body as Record<string, unknown>;
        const vehicleId = parsePositiveInt(body.vehicleId);
        if (vehicleId === null) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "vehicleId must be a positive integer" },
            });
            return;
        }

        const vehicle = await this.loadOwnedVehicle(res, vehicleId, ownerId);
        if (!vehicle) return;

        const serviceItemId = parsePositiveInt(body.serviceItemId);
        if (serviceItemId === null) {
            res.status(400).json({
                error: {
                    code: 400,
                    type: "BadRequest",
                    message: "serviceItemId must be a positive integer",
                },
            });
            return;
        }

        const dueDate = parseDueDate(body.dueDate);
        if (!dueDate) {
            res.status(400).json({
                error: {
                    code: 400,
                    type: "BadRequest",
                    message: "Invalid dueDate",
                    details: { field: "dueDate" },
                },
            });
            return;
        }

        const status = String(body.status ?? "").trim();
        if (status === "") {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "status is required" },
            });
            return;
        }

        const msgRaw = body.message;
        const message =
            msgRaw === undefined || msgRaw === null
                ? null
                : typeof msgRaw === "string"
                  ? msgRaw.trim() || null
                  : null;

        try {
            const item = await this.serviceItemsRepo.findById(serviceItemId);
            if (!item) {
                res.status(404).json({
                    error: {
                        code: 404,
                        type: "NotFound",
                        message: "Service item not found",
                        details: { field: "serviceItemId" },
                    },
                });
                return;
            }

            const row = await this.alertsRepo.createAlert({
                userId: ownerId,
                vehicleId,
                serviceItemId,
                dueDate,
                status,
                message,
                acknowledged: false,
            });

            res.status(201).json(sanitizeAlert(row));
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to create alert",
                },
            });
        }
    }

    /** GET /alerts */
    async listAlerts(req: Request, res: Response): Promise<void> {
        const ownerId = authUserId(req);
        if (ownerId === null) {
            res.status(401).json({
                error: { code: 401, type: "Unauthorized", message: "Authentication required" },
            });
            return;
        }

        const pagination = parsePaginationQuery(req);
        if (!pagination) {
            res.status(400).json({
                error: {
                    code: 400,
                    type: "BadRequest",
                    message: `Invalid pagination; limit 1–${MAX_PAGE_LIMIT}, offset >= 0`,
                },
            });
            return;
        }

        const rawStatus = req.query.status;
        const statusFilter =
            rawStatus === undefined || rawStatus === ""
                ? undefined
                : String(rawStatus).trim();

        const rawVehicleId = req.query.vehicleId;
        let vehicleFilter: number | undefined;
        if (rawVehicleId !== undefined && rawVehicleId !== "") {
            const vid = parsePositiveInt(rawVehicleId);
            if (vid === null) {
                res.status(400).json({
                    error: { code: 400, type: "BadRequest", message: "Invalid vehicleId query" },
                });
                return;
            }
            const vehicle = await this.loadOwnedVehicle(res, vid, ownerId);
            if (!vehicle) return;
            vehicleFilter = vid;
        }

        try {
            const rows = await this.alertsRepo.listByUserIdPaginated(ownerId, {
                ...pagination,
                ...(statusFilter !== undefined && statusFilter !== ""
                    ? { status: statusFilter }
                    : {}),
                ...(vehicleFilter !== undefined ? { vehicleId: vehicleFilter } : {}),
            });
            res.status(200).json(rows.map(sanitizeAlert));
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to list alerts",
                },
            });
        }
    }

    /** GET /alerts/:alertId */
    async getAlertById(req: Request, res: Response): Promise<void> {
        const ownerId = authUserId(req);
        if (ownerId === null) {
            res.status(401).json({
                error: { code: 401, type: "Unauthorized", message: "Authentication required" },
            });
            return;
        }

        const alertId = parsePositiveInt(req.params.alertId);
        if (alertId === null) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "Invalid alertId" },
            });
            return;
        }

        try {
            const row = await this.alertsRepo.findById(alertId);
            if (!row) {
                res.status(404).json({
                    error: { code: 404, type: "NotFound", message: "Alert not found" },
                });
                return;
            }
            if (row.userId !== ownerId) {
                res.status(401).json({
                    error: {
                        code: 401,
                        type: "Unauthorized",
                        message: "Alert does not belong to authenticated user",
                    },
                });
                return;
            }
            res.status(200).json(sanitizeAlert(row));
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to fetch alert",
                },
            });
        }
    }

    /** PUT /alerts/:alertId */
    async updateAlert(req: Request, res: Response): Promise<void> {
        const ownerId = authUserId(req);
        if (ownerId === null) {
            res.status(401).json({
                error: { code: 401, type: "Unauthorized", message: "Authentication required" },
            });
            return;
        }

        const alertId = parsePositiveInt(req.params.alertId);
        if (alertId === null) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "Invalid alertId" },
            });
            return;
        }

        const body = (req.body ?? {}) as Record<string, unknown>;
        const allowed = new Set(["dueDate", "status", "message", "acknowledged"]);
        const unknown = Object.keys(body).filter((k) => !allowed.has(k));
        if (unknown.length > 0) {
            res.status(400).json({
                error: {
                    code: 400,
                    type: "BadRequest",
                    message: `Unknown or disallowed fields: ${unknown.join(", ")}`,
                },
            });
            return;
        }

        try {
            const existing = await this.alertsRepo.findById(alertId);
            if (!existing) {
                res.status(404).json({
                    error: { code: 404, type: "NotFound", message: "Alert not found" },
                });
                return;
            }
            if (existing.userId !== ownerId) {
                res.status(401).json({
                    error: {
                        code: 401,
                        type: "Unauthorized",
                        message: "Alert does not belong to authenticated user",
                    },
                });
                return;
            }

            const patch: Partial<{
                dueDate: Date | null;
                status: string;
                message: string | null;
                acknowledged: boolean;
            }> = {};

            if (Object.prototype.hasOwnProperty.call(body, "dueDate")) {
                const d = body.dueDate;
                if (d === null || d === undefined || d === "") {
                    patch.dueDate = null;
                } else {
                    const parsed = parseDueDate(d);
                    if (!parsed) {
                        res.status(400).json({
                            error: { code: 400, type: "BadRequest", message: "Invalid dueDate" },
                        });
                        return;
                    }
                    patch.dueDate = parsed;
                }
            }

            if (Object.prototype.hasOwnProperty.call(body, "status")) {
                const s = body.status;
                if (s === null || s === undefined) {
                    res.status(400).json({
                        error: { code: 400, type: "BadRequest", message: "status cannot be null" },
                    });
                    return;
                }
                const st = String(s).trim();
                if (st === "") {
                    res.status(400).json({
                        error: { code: 400, type: "BadRequest", message: "status cannot be empty" },
                    });
                    return;
                }
                patch.status = st;
            }

            if (Object.prototype.hasOwnProperty.call(body, "message")) {
                const m = body.message;
                if (m === null || m === undefined) patch.message = null;
                else if (typeof m === "string") patch.message = m.trim() || null;
                else {
                    res.status(400).json({
                        error: { code: 400, type: "BadRequest", message: "message must be a string" },
                    });
                    return;
                }
            }

            if (Object.prototype.hasOwnProperty.call(body, "acknowledged")) {
                const a = body.acknowledged;
                if (typeof a !== "boolean") {
                    res.status(400).json({
                        error: {
                            code: 400,
                            type: "BadRequest",
                            message: "acknowledged must be a boolean",
                        },
                    });
                    return;
                }
                patch.acknowledged = a;
            }

            if (Object.keys(patch).length === 0) {
                res.status(200).json(sanitizeAlert(existing));
                return;
            }

            const updated = await this.alertsRepo.updateAlert(alertId, patch);
            if (!updated) {
                res.status(404).json({
                    error: { code: 404, type: "NotFound", message: "Alert not found" },
                });
                return;
            }
            res.status(200).json(sanitizeAlert(updated));
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to update alert",
                },
            });
        }
    }

    /** DELETE /alerts/:alertId */
    async deleteAlert(req: Request, res: Response): Promise<void> {
        const ownerId = authUserId(req);
        if (ownerId === null) {
            res.status(401).json({
                error: { code: 401, type: "Unauthorized", message: "Authentication required" },
            });
            return;
        }

        const alertId = parsePositiveInt(req.params.alertId);
        if (alertId === null) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "Invalid alertId" },
            });
            return;
        }

        try {
            const existing = await this.alertsRepo.findById(alertId);
            if (!existing) {
                res.status(404).json({
                    error: { code: 404, type: "NotFound", message: "Alert not found" },
                });
                return;
            }
            if (existing.userId !== ownerId) {
                res.status(401).json({
                    error: {
                        code: 401,
                        type: "Unauthorized",
                        message: "Alert does not belong to authenticated user",
                    },
                });
                return;
            }

            await this.alertsRepo.deleteById(alertId);
            res.status(200).send();
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to delete alert",
                },
            });
        }
    }
}
