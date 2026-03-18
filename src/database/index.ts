import { Sequelize } from "sequelize";
import { Config } from "../common/config";

export function createSequelize(config: Config): Sequelize {
    const storage = config.getDatabasePath();

    return new Sequelize({
        dialect: "sqlite",
        storage,
        logging: config.getNodeEnv() === "development" ? console.log : false,
    });
}

