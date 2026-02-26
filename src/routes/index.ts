import { Router } from "express";
import * as handlers from "./handlers";

/**
 * Central API router. Registers every route from API.md and maps each to its handler.
 * No business logic here—only route → handler wiring.
 */
const router = Router();

// —— Users (API.md) ——
router.post("/users", handlers.users.createUser);
router.get("/users/:userId", handlers.users.getCurrentUser);
router.get("/users/:userId/vehicles", handlers.vehicles.listVehicles);

// —— Vehicles (API.md) ——
router.post("/vehicles", handlers.vehicles.createVehicle);
router.get("/vehicles/:vehicleId", handlers.vehicles.getVehicleById);
router.put("/vehicles/:vehicleId", handlers.vehicles.updateVehicle);
router.delete("/vehicles/:vehicleId", handlers.vehicles.deleteVehicle);

// —— Service records (API.md), scoped under vehicles ——
router.post("/vehicles/:vehicleId/services", handlers.serviceRecords.createServiceRecord);
router.get("/vehicles/:vehicleId/services", handlers.serviceRecords.listServiceRecords);
router.get("/vehicles/:vehicleId/services/:serviceRecordId", handlers.serviceRecords.getServiceRecordById);
router.put("/vehicles/:vehicleId/services/:serviceRecordId", handlers.serviceRecords.updateServiceRecord);
router.delete("/vehicles/:vehicleId/services/:serviceRecordId", handlers.serviceRecords.deleteServiceRecord);

// —— Alerts (API.md) ——
router.post("/alerts", handlers.alerts.createAlert);
router.get("/alerts", handlers.alerts.listAlerts);
router.get("/alerts/:alertId", handlers.alerts.getAlertById);
router.put("/alerts/:alertId", handlers.alerts.updateAlert);
router.delete("/alerts/:alertId", handlers.alerts.deleteAlert);

export default router;
