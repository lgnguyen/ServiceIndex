import type { Request, Response } from "express";

/** Placeholder until validators and business logic (Step 8). */
const NOT_IMPLEMENTED = { message: "Not implemented" };

export class VehiclesHandler {
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
