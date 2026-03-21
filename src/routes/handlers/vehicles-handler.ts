import type { Request, Response } from "express";
import type { AuthConfig } from "../validators";
import type { MakeRepository, ModelRepository, VehicleRepository } from "../../database/repositories";
import type { Vehicle } from "../../database/models";

interface VehicleResponse {
    id: number;
    uuid: string;
    userId: number;
    nickname: string | null;
    year: number | null;
    makeId: number | null;
    modelId: number | null;
    vin: string | null;
    mileage: number | null;
    createdAt: Date;
    updatedAt: Date;
}

function sanitizeVehicle(v: Vehicle): VehicleResponse {
    return {
        id: v.id,
        uuid: v.uuid,
        userId: v.userId,
        nickname: v.nickname,
        year: v.year,
        makeId: v.makeId,
        modelId: v.modelId,
        vin: v.vin,
        mileage: v.mileage,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
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

export class VehiclesHandler {
    constructor(
        private readonly deps?: {
            config?: AuthConfig;
            repositories?: {
                vehicles?: VehicleRepository;
                makes?: MakeRepository;
                models?: ModelRepository;
            };
        }
    ) {}

    private get vehiclesRepo(): VehicleRepository {
        const r = this.deps?.repositories?.vehicles;
        if (!r) throw new Error("VehicleRepository is not configured");
        return r;
    }

    private get makesRepo(): MakeRepository {
        const r = this.deps?.repositories?.makes;
        if (!r) throw new Error("MakeRepository is not configured");
        return r;
    }

    private get modelsRepo(): ModelRepository {
        const r = this.deps?.repositories?.models;
        if (!r) throw new Error("ModelRepository is not configured");
        return r;
    }

    /** POST /vehicles */
    async createVehicle(req: Request, res: Response): Promise<void> {
        const userId = authUserId(req);
        if (userId === null) {
            res.status(401).json({
                error: { code: 401, type: "Unauthorized", message: "Authentication required" },
            });
            return;
        }

        const body = req.body as Record<string, unknown>;
        const makeId = parsePositiveInt(body.makeId);
        const modelId = parsePositiveInt(body.modelId);
        if (makeId === null || modelId === null) {
            res.status(400).json({
                error: {
                    code: 400,
                    type: "BadRequest",
                    message: "makeId and modelId must be positive integers",
                },
            });
            return;
        }

        try {
            const make = await this.makesRepo.findById(makeId);
            if (!make) {
                res.status(400).json({
                    error: {
                        code: 400,
                        type: "BadRequest",
                        message: "Invalid makeId",
                        details: { field: "makeId" },
                    },
                });
                return;
            }

            const model = await this.modelsRepo.findById(modelId);
            if (!model || model.makeId !== makeId) {
                res.status(400).json({
                    error: {
                        code: 400,
                        type: "BadRequest",
                        message: "Invalid modelId or model does not belong to make",
                        details: { field: "modelId" },
                    },
                });
                return;
            }

            const nickname = String(body.nickname ?? "").trim();
            const year = Number(body.year);
            const vinRaw = body.vin;
            const vin =
                vinRaw === undefined || vinRaw === null || vinRaw === ""
                    ? null
                    : String(vinRaw).trim() || null;

            const vehicle = await this.vehiclesRepo.createVehicle({
                userId,
                nickname,
                year: Number.isInteger(year) ? year : null,
                makeId,
                modelId,
                vin,
                mileage: null,
            });

            res.status(201).json(sanitizeVehicle(vehicle));
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to create vehicle",
                },
            });
        }
    }

    /** GET /users/:userId/vehicles — list (API.md uses GET /vehicles/:userId; we use nested path to avoid collision with GET /vehicles/:vehicleId). */
    async listVehicles(req: Request, res: Response): Promise<void> {
        const userId = parsePositiveInt(req.params.userId);
        if (userId === null) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "Invalid userId" },
            });
            return;
        }

        try {
            const rows = await this.vehiclesRepo.listByUserId(userId);
            res.status(200).json(rows.map(sanitizeVehicle));
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to list vehicles",
                },
            });
        }
    }

    /** GET /vehicles/:vehicleId */
    async getVehicleById(req: Request, res: Response): Promise<void> {
        const ownerId = authUserId(req);
        if (ownerId === null) {
            res.status(401).json({
                error: { code: 401, type: "Unauthorized", message: "Authentication required" },
            });
            return;
        }

        const vehicleId = parsePositiveInt(req.params.vehicleId);
        if (vehicleId === null) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "Invalid vehicleId" },
            });
            return;
        }

        try {
            const vehicle = await this.vehiclesRepo.findById(vehicleId);
            if (!vehicle) {
                res.status(404).json({
                    error: { code: 404, type: "NotFound", message: "Vehicle not found" },
                });
                return;
            }
            if (vehicle.userId !== ownerId) {
                res.status(401).json({
                    error: {
                        code: 401,
                        type: "Unauthorized",
                        message: "Vehicle does not belong to authenticated user",
                    },
                });
                return;
            }
            res.status(200).json(sanitizeVehicle(vehicle));
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to fetch vehicle",
                },
            });
        }
    }

    /** PUT /vehicles/:vehicleId */
    async updateVehicle(req: Request, res: Response): Promise<void> {
        const ownerId = authUserId(req);
        if (ownerId === null) {
            res.status(401).json({
                error: { code: 401, type: "Unauthorized", message: "Authentication required" },
            });
            return;
        }

        const vehicleId = parsePositiveInt(req.params.vehicleId);
        if (vehicleId === null) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "Invalid vehicleId" },
            });
            return;
        }

        const body = (req.body ?? {}) as Record<string, unknown>;
        const allowed = new Set([
            "nickname",
            "year",
            "makeId",
            "modelId",
            "vin",
            "mileage",
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
            const vehicle = await this.vehiclesRepo.findById(vehicleId);
            if (!vehicle) {
                res.status(404).json({
                    error: { code: 404, type: "NotFound", message: "Vehicle not found" },
                });
                return;
            }
            if (vehicle.userId !== ownerId) {
                res.status(401).json({
                    error: {
                        code: 401,
                        type: "Unauthorized",
                        message: "Vehicle does not belong to authenticated user",
                    },
                });
                return;
            }

            const patch: Partial<{
                nickname: string | null;
                year: number | null;
                makeId: number | null;
                modelId: number | null;
                vin: string | null;
                mileage: number | null;
            }> = {};

            if (Object.prototype.hasOwnProperty.call(body, "nickname")) {
                const n = body.nickname;
                if (n === null || n === undefined) {
                    patch.nickname = null;
                } else if (typeof n === "string") {
                    const t = n.trim();
                    patch.nickname = t === "" ? null : t;
                } else {
                    res.status(400).json({
                        error: { code: 400, type: "BadRequest", message: "nickname must be a string" },
                    });
                    return;
                }
            }

            if (Object.prototype.hasOwnProperty.call(body, "year")) {
                const y = body.year;
                if (y === null || y === undefined) {
                    patch.year = null;
                } else {
                    const yn = Number(y);
                    if (!Number.isInteger(yn) || yn < 1900 || yn > 2100) {
                        res.status(400).json({
                            error: { code: 400, type: "BadRequest", message: "Invalid year" },
                        });
                        return;
                    }
                    patch.year = yn;
                }
            }

            if (Object.prototype.hasOwnProperty.call(body, "vin")) {
                const v = body.vin;
                if (v === null || v === undefined || v === "") {
                    patch.vin = null;
                } else if (typeof v === "string") {
                    patch.vin = v.trim() || null;
                } else {
                    res.status(400).json({
                        error: { code: 400, type: "BadRequest", message: "vin must be a string" },
                    });
                    return;
                }
            }

            if (Object.prototype.hasOwnProperty.call(body, "mileage")) {
                const m = body.mileage;
                if (m === null || m === undefined) {
                    patch.mileage = null;
                } else {
                    const mn = Number(m);
                    if (!Number.isInteger(mn) || mn < 0) {
                        res.status(400).json({
                            error: { code: 400, type: "BadRequest", message: "Invalid mileage" },
                        });
                        return;
                    }
                    patch.mileage = mn;
                }
            }

            const hasMake = Object.prototype.hasOwnProperty.call(body, "makeId");
            const hasModel = Object.prototype.hasOwnProperty.call(body, "modelId");
            if (hasMake !== hasModel) {
                res.status(400).json({
                    error: {
                        code: 400,
                        type: "BadRequest",
                        message: "makeId and modelId must be updated together",
                    },
                });
                return;
            }

            if (hasMake && hasModel) {
                const mk = parsePositiveInt(body.makeId);
                const md = parsePositiveInt(body.modelId);
                if (mk === null || md === null) {
                    res.status(400).json({
                        error: {
                            code: 400,
                            type: "BadRequest",
                            message: "makeId and modelId must be positive integers",
                        },
                    });
                    return;
                }
                const make = await this.makesRepo.findById(mk);
                if (!make) {
                    res.status(400).json({
                        error: {
                            code: 400,
                            type: "BadRequest",
                            message: "Invalid makeId",
                            details: { field: "makeId" },
                        },
                    });
                    return;
                }
                const model = await this.modelsRepo.findById(md);
                if (!model || model.makeId !== mk) {
                    res.status(400).json({
                        error: {
                            code: 400,
                            type: "BadRequest",
                            message: "Invalid modelId or model does not belong to make",
                            details: { field: "modelId" },
                        },
                    });
                    return;
                }
                patch.makeId = mk;
                patch.modelId = md;
            }

            if (Object.keys(patch).length === 0) {
                res.status(200).json(sanitizeVehicle(vehicle));
                return;
            }

            const updated = await this.vehiclesRepo.updateVehicle(vehicleId, patch);
            if (!updated) {
                res.status(404).json({
                    error: { code: 404, type: "NotFound", message: "Vehicle not found" },
                });
                return;
            }
            res.status(200).json(sanitizeVehicle(updated));
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to update vehicle",
                },
            });
        }
    }

    /** DELETE /vehicles/:vehicleId */
    async deleteVehicle(req: Request, res: Response): Promise<void> {
        const ownerId = authUserId(req);
        if (ownerId === null) {
            res.status(401).json({
                error: { code: 401, type: "Unauthorized", message: "Authentication required" },
            });
            return;
        }

        const vehicleId = parsePositiveInt(req.params.vehicleId);
        if (vehicleId === null) {
            res.status(400).json({
                error: { code: 400, type: "BadRequest", message: "Invalid vehicleId" },
            });
            return;
        }

        try {
            const vehicle = await this.vehiclesRepo.findById(vehicleId);
            if (!vehicle) {
                res.status(404).json({
                    error: { code: 404, type: "NotFound", message: "Vehicle not found" },
                });
                return;
            }
            if (vehicle.userId !== ownerId) {
                res.status(401).json({
                    error: {
                        code: 401,
                        type: "Unauthorized",
                        message: "Vehicle does not belong to authenticated user",
                    },
                });
                return;
            }

            await this.vehiclesRepo.deleteById(vehicleId);
            res.status(200).send();
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to delete vehicle",
                },
            });
        }
    }
}
