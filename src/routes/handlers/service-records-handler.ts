import type { Request, Response } from "express";
import type { AuthConfig } from "../validators";
import type {
    ServiceItemRepository,
    ServiceRecordRepository,
    VehicleRepository,
} from "../../database/repositories";
import type { ServiceRecord, Vehicle } from "../../database/models";

const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 100;

interface ServiceRecordResponse {
    id: number;
    uuid: string;
    vehicleId: number;
    serviceItemId: number;
    performedAt: Date | null;
    odometer: number | null;
    notes: string | null;
    serviceLocation: string | null;
    productName: string | null;
    cost: number | null;
    interval: number | null;
    createdAt: Date;
    updatedAt: Date;
}

function sanitizeServiceRecord(row: ServiceRecord): ServiceRecordResponse {
    return {
        id: row.id,
        uuid: row.uuid,
        vehicleId: row.vehicleId,
        serviceItemId: row.serviceItemId,
        performedAt: row.performedAt,
        odometer: row.odometer,
        notes: row.notes,
        serviceLocation: row.serviceLocation,
        productName: row.productName,
        cost: row.cost,
        interval: row.interval,
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

function parsePerformedAt(value: unknown): Date | null {
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

export class ServiceRecordsHandler {
    constructor(
        private readonly deps?: {
            config?: AuthConfig;
            repositories?: {
                serviceRecords?: ServiceRecordRepository;
                vehicles?: VehicleRepository;
                serviceItems?: ServiceItemRepository;
            };
        }
    ) {}

    private get serviceRecordsRepo(): ServiceRecordRepository {
        const r = this.deps?.repositories?.serviceRecords;
        if (!r) throw new Error("ServiceRecordRepository is not configured");
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

    /**
     * Ensure vehicle exists and belongs to owner. Sends response on failure.
     * @returns vehicle when OK.
     */
    private async loadOwnedVehicle(
        res: Response,
        vehicleId: number,
        ownerId: number | null
    ): Promise<Vehicle | null> {
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
        return vehicle;
    }

    /** POST /vehicles/:vehicleId/services */
    async createServiceRecord(req: Request, res: Response): Promise<void> {
        const ownerId = authUserId(req);
        const vehicleId = parsePositiveInt(req.params.vehicleId);
        if (vehicleId === null) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "Invalid vehicleId" },
            });
            return;
        }

        const vehicle = await this.loadOwnedVehicle(res, vehicleId, ownerId);
        if (!vehicle) return;

        const body = req.body as Record<string, unknown>;
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

        const performedAt = parsePerformedAt(body.performedAt);
        if (!performedAt) {
            res.status(400).json({
                error: {
                    code: 400,
                    type: "BadRequest",
                    message: "Invalid performedAt date",
                    details: { field: "performedAt" },
                },
            });
            return;
        }

        const odometer = Number(body.odometer);
        if (!Number.isInteger(odometer) || odometer < 0) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "Invalid odometer" },
            });
            return;
        }

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

            const notesRaw = body.notes;
            const notes =
                notesRaw === undefined || notesRaw === null
                    ? null
                    : typeof notesRaw === "string"
                      ? notesRaw.trim() || null
                      : null;

            const row = await this.serviceRecordsRepo.createServiceRecord({
                vehicleId,
                serviceItemId,
                performedAt,
                odometer,
                notes,
                serviceLocation: null,
                productName: null,
                cost: null,
                interval: null,
            });

            res.status(201).json(sanitizeServiceRecord(row));
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to create service record",
                },
            });
        }
    }

    /** GET /vehicles/:vehicleId/services */
    async listServiceRecords(req: Request, res: Response): Promise<void> {
        const ownerId = authUserId(req);
        const vehicleId = parsePositiveInt(req.params.vehicleId);
        if (vehicleId === null) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "Invalid vehicleId" },
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

        const vehicle = await this.loadOwnedVehicle(res, vehicleId, ownerId);
        if (!vehicle) return;

        try {
            const rows = await this.serviceRecordsRepo.listByVehicleIdPaginated(
                vehicleId,
                pagination
            );
            res.status(200).json(rows.map(sanitizeServiceRecord));
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to list service records",
                },
            });
        }
    }

    /** GET /vehicles/:vehicleId/services/:serviceRecordId */
    async getServiceRecordById(req: Request, res: Response): Promise<void> {
        const ownerId = authUserId(req);
        const vehicleId = parsePositiveInt(req.params.vehicleId);
        const recordId = parsePositiveInt(req.params.serviceRecordId);
        if (vehicleId === null || recordId === null) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "Invalid path parameters" },
            });
            return;
        }

        const vehicle = await this.loadOwnedVehicle(res, vehicleId, ownerId);
        if (!vehicle) return;

        try {
            const row = await this.serviceRecordsRepo.findById(recordId);
            if (!row || row.vehicleId !== vehicleId) {
                res.status(404).json({
                    error: { code: 404, type: "NotFound", message: "Service record not found" },
                });
                return;
            }
            res.status(200).json(sanitizeServiceRecord(row));
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to fetch service record",
                },
            });
        }
    }

    /** PUT /vehicles/:vehicleId/services/:serviceRecordId */
    async updateServiceRecord(req: Request, res: Response): Promise<void> {
        const ownerId = authUserId(req);
        const vehicleId = parsePositiveInt(req.params.vehicleId);
        const recordId = parsePositiveInt(req.params.serviceRecordId);
        if (vehicleId === null || recordId === null) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "Invalid path parameters" },
            });
            return;
        }

        const vehicle = await this.loadOwnedVehicle(res, vehicleId, ownerId);
        if (!vehicle) return;

        const body = (req.body ?? {}) as Record<string, unknown>;
        const allowed = new Set([
            "performedAt",
            "odometer",
            "notes",
            "serviceLocation",
            "productName",
            "cost",
            "interval",
        ]);
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
            const existing = await this.serviceRecordsRepo.findById(recordId);
            if (!existing || existing.vehicleId !== vehicleId) {
                res.status(404).json({
                    error: { code: 404, type: "NotFound", message: "Service record not found" },
                });
                return;
            }

            const patch: Partial<{
                performedAt: Date | null;
                odometer: number | null;
                notes: string | null;
                serviceLocation: string | null;
                productName: string | null;
                cost: number | null;
                interval: number | null;
            }> = {};

            if (Object.prototype.hasOwnProperty.call(body, "performedAt")) {
                const p = body.performedAt;
                if (p === null || p === undefined || p === "") {
                    patch.performedAt = null;
                } else {
                    const d = parsePerformedAt(p);
                    if (!d) {
                        res.status(400).json({
                            error: {
                                code: 400,
                                type: "BadRequest",
                                message: "Invalid performedAt",
                            },
                        });
                        return;
                    }
                    patch.performedAt = d;
                }
            }

            if (Object.prototype.hasOwnProperty.call(body, "odometer")) {
                const o = body.odometer;
                if (o === null || o === undefined) {
                    patch.odometer = null;
                } else {
                    const on = Number(o);
                    if (!Number.isInteger(on) || on < 0) {
                        res.status(400).json({
                            error: { code: 400, type: "BadRequest", message: "Invalid odometer" },
                        });
                        return;
                    }
                    patch.odometer = on;
                }
            }

            if (Object.prototype.hasOwnProperty.call(body, "notes")) {
                const n = body.notes;
                if (n === null || n === undefined) patch.notes = null;
                else if (typeof n === "string") patch.notes = n.trim() || null;
                else {
                    res.status(400).json({
                        error: { code: 400, type: "BadRequest", message: "notes must be a string" },
                    });
                    return;
                }
            }

            if (Object.prototype.hasOwnProperty.call(body, "serviceLocation")) {
                const v = body.serviceLocation;
                if (v === null || v === undefined) patch.serviceLocation = null;
                else if (typeof v === "string") patch.serviceLocation = v.trim() || null;
                else {
                    res.status(400).json({
                        error: {
                            code: 400,
                            type: "BadRequest",
                            message: "serviceLocation must be a string",
                        },
                    });
                    return;
                }
            }

            if (Object.prototype.hasOwnProperty.call(body, "productName")) {
                const v = body.productName;
                if (v === null || v === undefined) patch.productName = null;
                else if (typeof v === "string") patch.productName = v.trim() || null;
                else {
                    res.status(400).json({
                        error: {
                            code: 400,
                            type: "BadRequest",
                            message: "productName must be a string",
                        },
                    });
                    return;
                }
            }

            if (Object.prototype.hasOwnProperty.call(body, "cost")) {
                const c = body.cost;
                if (c === null || c === undefined) patch.cost = null;
                else {
                    const cn = Number(c);
                    if (Number.isNaN(cn) || cn < 0) {
                        res.status(400).json({
                            error: { code: 400, type: "BadRequest", message: "Invalid cost" },
                        });
                        return;
                    }
                    patch.cost = cn;
                }
            }

            if (Object.prototype.hasOwnProperty.call(body, "interval")) {
                const i = body.interval;
                if (i === null || i === undefined) patch.interval = null;
                else {
                    const iv = Number(i);
                    if (!Number.isInteger(iv) || iv < 0) {
                        res.status(400).json({
                            error: { code: 400, type: "BadRequest", message: "Invalid interval" },
                        });
                        return;
                    }
                    patch.interval = iv;
                }
            }

            if (Object.keys(patch).length === 0) {
                res.status(200).json(sanitizeServiceRecord(existing));
                return;
            }

            const updated = await this.serviceRecordsRepo.updateServiceRecord(recordId, patch);
            if (!updated) {
                res.status(404).json({
                    error: { code: 404, type: "NotFound", message: "Service record not found" },
                });
                return;
            }
            res.status(200).json(sanitizeServiceRecord(updated));
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to update service record",
                },
            });
        }
    }

    /** DELETE /vehicles/:vehicleId/services/:serviceRecordId */
    async deleteServiceRecord(req: Request, res: Response): Promise<void> {
        const ownerId = authUserId(req);
        const vehicleId = parsePositiveInt(req.params.vehicleId);
        const recordId = parsePositiveInt(req.params.serviceRecordId);
        if (vehicleId === null || recordId === null) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "Invalid path parameters" },
            });
            return;
        }

        const vehicle = await this.loadOwnedVehicle(res, vehicleId, ownerId);
        if (!vehicle) return;

        try {
            const existing = await this.serviceRecordsRepo.findById(recordId);
            if (!existing || existing.vehicleId !== vehicleId) {
                res.status(404).json({
                    error: { code: 404, type: "NotFound", message: "Service record not found" },
                });
                return;
            }

            await this.serviceRecordsRepo.deleteById(recordId);
            res.status(200).send();
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to delete service record",
                },
            });
        }
    }
}
