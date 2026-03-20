import { UsersHandler } from "./users-handler";
import { VehiclesHandler } from "./vehicles-handler";
import { ServiceRecordsHandler } from "./service-records-handler";
import { AlertsHandler } from "./alerts-handler";
import type { AuthConfig } from "../validators";
import type {
    AlertRepository,
    MakeRepository,
    ModelRepository,
    ServiceItemRepository,
    ServiceRecordRepository,
    UserRepository,
    VehicleRepository,
} from "../../database/repositories";

export interface HandlerDependencies {
    config: AuthConfig;
    repositories: {
        users: UserRepository;
        vehicles: VehicleRepository;
        serviceRecords: ServiceRecordRepository;
        serviceItems: ServiceItemRepository;
        makes: MakeRepository;
        models: ModelRepository;
        alerts: AlertRepository;
    };
}

export interface Handlers {
    users: {
        createUser: UsersHandler["createUser"];
        getCurrentUser: UsersHandler["getCurrentUser"];
    };
    vehicles: {
        createVehicle: VehiclesHandler["createVehicle"];
        listVehicles: VehiclesHandler["listVehicles"];
        getVehicleById: VehiclesHandler["getVehicleById"];
        updateVehicle: VehiclesHandler["updateVehicle"];
        deleteVehicle: VehiclesHandler["deleteVehicle"];
    };
    serviceRecords: {
        createServiceRecord: ServiceRecordsHandler["createServiceRecord"];
        listServiceRecords: ServiceRecordsHandler["listServiceRecords"];
        getServiceRecordById: ServiceRecordsHandler["getServiceRecordById"];
        updateServiceRecord: ServiceRecordsHandler["updateServiceRecord"];
        deleteServiceRecord: ServiceRecordsHandler["deleteServiceRecord"];
    };
    alerts: {
        createAlert: AlertsHandler["createAlert"];
        listAlerts: AlertsHandler["listAlerts"];
        getAlertById: AlertsHandler["getAlertById"];
        updateAlert: AlertsHandler["updateAlert"];
        deleteAlert: AlertsHandler["deleteAlert"];
    };
}

export function createHandlers(deps: HandlerDependencies): Handlers {
    const usersHandlers = new UsersHandler({
        config: deps.config,
        repositories: { users: deps.repositories.users },
    });
    const vehiclesHandlers = new VehiclesHandler({
        config: deps.config,
        repositories: { vehicles: deps.repositories.vehicles },
    });
    const serviceRecordsHandlers = new ServiceRecordsHandler({
        config: deps.config,
        repositories: { serviceRecords: deps.repositories.serviceRecords },
    });
    const alertsHandlers = new AlertsHandler({
        config: deps.config,
        repositories: { alerts: deps.repositories.alerts },
    });

    return {
        users: {
            createUser: usersHandlers.createUser.bind(usersHandlers),
            getCurrentUser: usersHandlers.getCurrentUser.bind(usersHandlers),
        },
        vehicles: {
            createVehicle: vehiclesHandlers.createVehicle.bind(vehiclesHandlers),
            listVehicles: vehiclesHandlers.listVehicles.bind(vehiclesHandlers),
            getVehicleById: vehiclesHandlers.getVehicleById.bind(vehiclesHandlers),
            updateVehicle: vehiclesHandlers.updateVehicle.bind(vehiclesHandlers),
            deleteVehicle: vehiclesHandlers.deleteVehicle.bind(vehiclesHandlers),
        },
        serviceRecords: {
            createServiceRecord: serviceRecordsHandlers.createServiceRecord.bind(serviceRecordsHandlers),
            listServiceRecords: serviceRecordsHandlers.listServiceRecords.bind(serviceRecordsHandlers),
            getServiceRecordById: serviceRecordsHandlers.getServiceRecordById.bind(serviceRecordsHandlers),
            updateServiceRecord: serviceRecordsHandlers.updateServiceRecord.bind(serviceRecordsHandlers),
            deleteServiceRecord: serviceRecordsHandlers.deleteServiceRecord.bind(serviceRecordsHandlers),
        },
        alerts: {
            createAlert: alertsHandlers.createAlert.bind(alertsHandlers),
            listAlerts: alertsHandlers.listAlerts.bind(alertsHandlers),
            getAlertById: alertsHandlers.getAlertById.bind(alertsHandlers),
            updateAlert: alertsHandlers.updateAlert.bind(alertsHandlers),
            deleteAlert: alertsHandlers.deleteAlert.bind(alertsHandlers),
        },
    };
}

export { UsersHandler, VehiclesHandler, ServiceRecordsHandler, AlertsHandler };
