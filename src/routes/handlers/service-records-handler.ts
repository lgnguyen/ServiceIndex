import type { Request, Response } from "express";
import type { AuthConfig } from "../validators";
import type { ServiceRecordRepository } from "../../database/repositories";

/** Placeholder until validators and business logic (Step 9). */
const NOT_IMPLEMENTED = { message: "Not implemented" };

export class ServiceRecordsHandler {
    constructor(
        private readonly deps?: {
            config?: AuthConfig;
            repositories?: {
                serviceRecords?: ServiceRecordRepository;
            };
        }
    ) {}

    /** POST /vehicles/:vehicleId/services — create service record. Will delegate to validator then business logic. */
    createServiceRecord(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }

    /** GET /vehicles/:vehicleId/services — list service records. Will delegate to validator then business logic. */
    listServiceRecords(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }

    /** GET /vehicles/:vehicleId/services/:serviceRecordId — get service record. Will delegate to validator then business logic. */
    getServiceRecordById(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }

    /** PUT /vehicles/:vehicleId/services/:serviceRecordId — update service record. Will delegate to validator then business logic. */
    updateServiceRecord(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }

    /** DELETE /vehicles/:vehicleId/services/:serviceRecordId — delete service record. Will delegate to validator then business logic. */
    deleteServiceRecord(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }
}
