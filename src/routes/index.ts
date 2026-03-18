import { Router } from "express";
import type { AuthConfig } from "./validators/base";
import * as validators from "./validators";
import * as handlers from "./handlers";

/**
 * Central API router. Registers every route from API.md as: validation middleware(s) then handler.
 * No business logic here—only route → middleware → handler wiring.
 */
export function createRouter(config: AuthConfig): Router {
    const router = Router();
    const requireAuth = validators.createRequireAuth(config);

    // —— Users (API.md) ——
    router.post("/users", validators.validateCreateUserBody, handlers.users.createUser);
    router.get(
        "/users/:userId",
        requireAuth,
        validators.validateUserIdMatchesAuth,
        handlers.users.getCurrentUser
    );
    router.get(
        "/users/:userId/vehicles",
        requireAuth,
        validators.validateUserIdMatchesAuth,
        handlers.vehicles.listVehicles
    );

    // —— Vehicles (API.md) ——
    router.post(
        "/vehicles",
        requireAuth,
        validators.validateCreateVehicleBody,
        handlers.vehicles.createVehicle
    );
    router.get(
        "/vehicles/:vehicleId",
        requireAuth,
        validators.validateVehicleIdParam,
        handlers.vehicles.getVehicleById
    );
    router.put(
        "/vehicles/:vehicleId",
        requireAuth,
        validators.validateVehicleIdParam,
        validators.validateUpdateVehicleBody,
        handlers.vehicles.updateVehicle
    );
    router.delete(
        "/vehicles/:vehicleId",
        requireAuth,
        validators.validateVehicleIdParam,
        handlers.vehicles.deleteVehicle
    );

    // —— Service records (API.md), scoped under vehicles ——
    router.post(
        "/vehicles/:vehicleId/services",
        requireAuth,
        validators.validateVehicleIdParam,
        validators.validateCreateServiceRecordBody,
        handlers.serviceRecords.createServiceRecord
    );
    router.get(
        "/vehicles/:vehicleId/services",
        requireAuth,
        validators.validateVehicleIdParam,
        handlers.serviceRecords.listServiceRecords
    );
    router.get(
        "/vehicles/:vehicleId/services/:serviceRecordId",
        requireAuth,
        validators.validateVehicleIdParam,
        validators.validateServiceRecordIdParam,
        handlers.serviceRecords.getServiceRecordById
    );
    router.put(
        "/vehicles/:vehicleId/services/:serviceRecordId",
        requireAuth,
        validators.validateVehicleIdParam,
        validators.validateServiceRecordIdParam,
        validators.validateUpdateServiceRecordBody,
        handlers.serviceRecords.updateServiceRecord
    );
    router.delete(
        "/vehicles/:vehicleId/services/:serviceRecordId",
        requireAuth,
        validators.validateVehicleIdParam,
        validators.validateServiceRecordIdParam,
        handlers.serviceRecords.deleteServiceRecord
    );

    // —— Alerts (API.md) ——
    router.post(
        "/alerts",
        requireAuth,
        validators.validateCreateAlertBody,
        handlers.alerts.createAlert
    );
    router.get("/alerts", requireAuth, handlers.alerts.listAlerts);
    router.get(
        "/alerts/:alertId",
        requireAuth,
        validators.validateAlertIdParam,
        handlers.alerts.getAlertById
    );
    router.put(
        "/alerts/:alertId",
        requireAuth,
        validators.validateAlertIdParam,
        validators.validateUpdateAlertBody,
        handlers.alerts.updateAlert
    );
    router.delete(
        "/alerts/:alertId",
        requireAuth,
        validators.validateAlertIdParam,
        handlers.alerts.deleteAlert
    );

    return router;
}

export type { AuthConfig };
