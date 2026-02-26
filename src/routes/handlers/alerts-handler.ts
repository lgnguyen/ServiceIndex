import type { Request, Response } from "express";

/** Placeholder until validators and business logic (Step 10). */
const NOT_IMPLEMENTED = { message: "Not implemented" };

export class AlertsHandler {
    /** POST /alerts — create alert. Will delegate to validator then business logic. */
    createAlert(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }

    /** GET /alerts — list alerts. Will delegate to validator then business logic. */
    listAlerts(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }

    /** GET /alerts/:alertId — get alert by id. Will delegate to validator then business logic. */
    getAlertById(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }

    /** PUT /alerts/:alertId — update alert. Will delegate to validator then business logic. */
    updateAlert(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }

    /** DELETE /alerts/:alertId — delete alert. Will delegate to validator then business logic. */
    deleteAlert(_req: Request, res: Response): void {
        res.status(501).json(NOT_IMPLEMENTED);
    }
}
