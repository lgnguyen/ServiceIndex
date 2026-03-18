import type { Sequelize, InferAttributes, InferCreationAttributes } from "sequelize";
import { DataTypes, Model } from "sequelize";

// User
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: number;
    declare email: string;
    declare passwordHash: string;
    declare name: string | null;
}

// Vehicle
export class Vehicle extends Model<InferAttributes<Vehicle>, InferCreationAttributes<Vehicle>> {
    declare id: number;
    declare userId: number;
    declare nickname: string | null;
    declare year: number | null;
    declare makeId: number | null;
    declare modelId: number | null;
}

// ServiceRecord
export class ServiceRecord extends Model<
    InferAttributes<ServiceRecord>,
    InferCreationAttributes<ServiceRecord>
> {
    declare id: number;
    declare vehicleId: number;
    declare serviceItemId: number;
    declare performedAt: Date | null;
    declare odometer: number | null;
    declare notes: string | null;
}

// ServiceItem
export class ServiceItem extends Model<
    InferAttributes<ServiceItem>,
    InferCreationAttributes<ServiceItem>
> {
    declare id: number;
    declare name: string;
}

// Make
export class Make extends Model<InferAttributes<Make>, InferCreationAttributes<Make>> {
    declare id: number;
    declare name: string;
}

// Model
export class ModelEntity extends Model<
    InferAttributes<ModelEntity>,
    InferCreationAttributes<ModelEntity>
> {
    declare id: number;
    declare makeId: number;
    declare name: string;
}

// Alert
export class Alert extends Model<InferAttributes<Alert>, InferCreationAttributes<Alert>> {
    declare id: number;
    declare userId: number;
    declare vehicleId: number;
    declare serviceItemId: number | null;
    declare dueDate: Date | null;
    declare status: string;
}

export function initModels(sequelize: Sequelize) {
    User.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            email: { type: DataTypes.STRING, allowNull: false, unique: true },
            passwordHash: { type: DataTypes.STRING, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: true },
        },
        { sequelize, tableName: "users" }
    );

    Vehicle.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: { type: DataTypes.INTEGER, allowNull: false },
            nickname: { type: DataTypes.STRING, allowNull: true },
            year: { type: DataTypes.INTEGER, allowNull: true },
            makeId: { type: DataTypes.INTEGER, allowNull: true },
            modelId: { type: DataTypes.INTEGER, allowNull: true },
        },
        { sequelize, tableName: "vehicles" }
    );

    ServiceRecord.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            vehicleId: { type: DataTypes.INTEGER, allowNull: false },
            serviceItemId: { type: DataTypes.INTEGER, allowNull: false },
            performedAt: { type: DataTypes.DATE, allowNull: true },
            odometer: { type: DataTypes.INTEGER, allowNull: true },
            notes: { type: DataTypes.TEXT, allowNull: true },
        },
        { sequelize, tableName: "service_records" }
    );

    ServiceItem.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false, unique: true },
        },
        { sequelize, tableName: "service_items" }
    );

    Make.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false, unique: true },
        },
        { sequelize, tableName: "makes" }
    );

    ModelEntity.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            makeId: { type: DataTypes.INTEGER, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },
        },
        { sequelize, tableName: "models" }
    );

    Alert.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: { type: DataTypes.INTEGER, allowNull: false },
            vehicleId: { type: DataTypes.INTEGER, allowNull: false },
            serviceItemId: { type: DataTypes.INTEGER, allowNull: true },
            dueDate: { type: DataTypes.DATE, allowNull: true },
            status: { type: DataTypes.STRING, allowNull: false },
        },
        { sequelize, tableName: "alerts" }
    );

    // Associations (minimal for now; can be expanded in later steps)
    User.hasMany(Vehicle, { foreignKey: "userId" });
    Vehicle.belongsTo(User, { foreignKey: "userId" });

    Vehicle.hasMany(ServiceRecord, { foreignKey: "vehicleId" });
    ServiceRecord.belongsTo(Vehicle, { foreignKey: "vehicleId" });

    ServiceItem.hasMany(ServiceRecord, { foreignKey: "serviceItemId" });
    ServiceRecord.belongsTo(ServiceItem, { foreignKey: "serviceItemId" });

    Make.hasMany(ModelEntity, { foreignKey: "makeId" });
    ModelEntity.belongsTo(Make, { foreignKey: "makeId" });

    Vehicle.belongsTo(Make, { foreignKey: "makeId" });
    Vehicle.belongsTo(ModelEntity, { foreignKey: "modelId" });

    User.hasMany(Alert, { foreignKey: "userId" });
    Vehicle.hasMany(Alert, { foreignKey: "vehicleId" });
    ServiceItem.hasMany(Alert, { foreignKey: "serviceItemId" });
    Alert.belongsTo(User, { foreignKey: "userId" });
    Alert.belongsTo(Vehicle, { foreignKey: "vehicleId" });
    Alert.belongsTo(ServiceItem, { foreignKey: "serviceItemId" });
}

