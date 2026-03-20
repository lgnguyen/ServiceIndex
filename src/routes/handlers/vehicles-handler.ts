import type { Request, Response } from "express";
import type { AuthConfig } from "../validators";
import type { VehicleRepository } from "../../database/repositories";

/** Placeholder until validators and business logic (Step 8). */
const NOT_IMPLEMENTED = { message: "Not implemented" };

export class VehiclesHandler {
    constructor(
        private readonly deps?: {
            config?: AuthConfig;
            repositories?: {
                vehicles?: VehicleRepository;
            };
        }
    ) {}

    /** POST /vehicles — create vehicle. Will delegate to validator then business logic. */
    createVehicle(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }

    /** GET /users/:userId/vehicles — list vehicles for user. Will delegate to validator then business logic. */
    listVehicles(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }

    /** GET /vehicles/:vehicleId — get vehicle by id. Will delegate to validator then business logic. */
    getVehicleById(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }

    /** PUT /vehicles/:vehicleId — update vehicle. Will delegate to validator then business logic. */
    updateVehicle(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }

    /** DELETE /vehicles/:vehicleId — delete vehicle. Will delegate to validator then business logic. */
    deleteVehicle(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }
}
