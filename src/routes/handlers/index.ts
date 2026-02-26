import { UsersHandler } from "./users-handler";
import { VehiclesHandler } from "./vehicles-handler";
import { ServiceRecordsHandler } from "./service-records-handler";
import { AlertsHandler } from "./alerts-handler";

const usersHandlers = new UsersHandler();
const vehiclesHandlers = new VehiclesHandler();
const serviceRecordsHandlers = new ServiceRecordsHandler();
const alertsHandlers = new AlertsHandler();

export const users = {
    createUser: usersHandlers.createUser.bind(usersHandlers),
    getCurrentUser: usersHandlers.getCurrentUser.bind(usersHandlers),
};

export const vehicles = {
    createVehicle: vehiclesHandlers.createVehicle.bind(vehiclesHandlers),
    listVehicles: vehiclesHandlers.listVehicles.bind(vehiclesHandlers),
    getVehicleById: vehiclesHandlers.getVehicleById.bind(vehiclesHandlers),
    updateVehicle: vehiclesHandlers.updateVehicle.bind(vehiclesHandlers),
    deleteVehicle: vehiclesHandlers.deleteVehicle.bind(vehiclesHandlers),
};

export const serviceRecords = {
    createServiceRecord: serviceRecordsHandlers.createServiceRecord.bind(serviceRecordsHandlers),
    listServiceRecords: serviceRecordsHandlers.listServiceRecords.bind(serviceRecordsHandlers),
    getServiceRecordById: serviceRecordsHandlers.getServiceRecordById.bind(serviceRecordsHandlers),
    updateServiceRecord: serviceRecordsHandlers.updateServiceRecord.bind(serviceRecordsHandlers),
    deleteServiceRecord: serviceRecordsHandlers.deleteServiceRecord.bind(serviceRecordsHandlers),
};

export const alerts = {
    createAlert: alertsHandlers.createAlert.bind(alertsHandlers),
    listAlerts: alertsHandlers.listAlerts.bind(alertsHandlers),
    getAlertById: alertsHandlers.getAlertById.bind(alertsHandlers),
    updateAlert: alertsHandlers.updateAlert.bind(alertsHandlers),
    deleteAlert: alertsHandlers.deleteAlert.bind(alertsHandlers),
};
