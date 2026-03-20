import { Config } from "../common";
import { createSequelize } from "../database";
import { initModels } from "../database/models";
import {
    AlertRepository,
    MakeRepository,
    ModelRepository,
    ServiceItemRepository,
    ServiceRecordRepository,
    UserRepository,
    VehicleRepository,
} from "../database/repositories";
import { createHandlers } from "../routes/handlers";

export interface AppRepositories {
    users: UserRepository;
    vehicles: VehicleRepository;
    serviceRecords: ServiceRecordRepository;
    serviceItems: ServiceItemRepository;
    makes: MakeRepository;
    models: ModelRepository;
    alerts: AlertRepository;
}

export interface AppContainer {
    config: Config;
    repositories: AppRepositories;
    handlers: ReturnType<typeof createHandlers>;
}

export function createAppContainer(config: Config = new Config()): AppContainer {
    const sequelize = createSequelize(config);
    initModels(sequelize);

    const repositories: AppRepositories = {
        users: new UserRepository(),
        vehicles: new VehicleRepository(),
        serviceRecords: new ServiceRecordRepository(),
        serviceItems: new ServiceItemRepository(),
        makes: new MakeRepository(),
        models: new ModelRepository(),
        alerts: new AlertRepository(),
    };

    const handlers = createHandlers({
        config,
        repositories,
    });

    return {
        config,
        repositories,
        handlers,
    };
}

