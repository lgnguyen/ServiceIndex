import type { Sequelize, InferAttributes, InferCreationAttributes } from "sequelize";
import { DataTypes, Model } from "sequelize";

// User
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: number;
    declare uuid: string;
    declare email: string;
    declare passwordHash: string;
    declare name: string | null;
    declare location: string | null;
    declare createdAt: Date;
    declare updatedAt: Date;
}

// Vehicle
export class Vehicle extends Model<InferAttributes<Vehicle>, InferCreationAttributes<Vehicle>> {
    declare id: number;
    declare uuid: string;
    declare userId: number;
    declare nickname: string | null;
    declare year: number | null;
    declare makeId: number | null;
    declare modelId: number | null;
    declare vin: string | null;
    declare mileage: number | null;
    declare createdAt: Date;
    declare updatedAt: Date;
}

// ServiceRecord
export class ServiceRecord extends Model<
    InferAttributes<ServiceRecord>,
    InferCreationAttributes<ServiceRecord>
> {
    declare id: number;
    declare uuid: string;
    declare vehicleId: number;
    declare serviceItemId: number;
    declare performedAt: Date | null;
    declare odometer: number | null;
    declare notes: string | null;
    declare serviceLocation: string | null;
    declare productName: string | null;
    declare cost: number | null;
    declare interval: number | null;
    declare createdAt: Date;
    declare updatedAt: Date;
}

// ServiceItem
export class ServiceItem extends Model<
    InferAttributes<ServiceItem>,
    InferCreationAttributes<ServiceItem>
> {
    declare id: number;
    declare itemType: string;
    declare recommendedInterval: number | null;
    declare createdAt: Date;
    declare updatedAt: Date;
}

// Make
export class Make extends Model<InferAttributes<Make>, InferCreationAttributes<Make>> {
    declare id: number;
    declare makeName: string;
    declare metadata: object | null;
    declare createdAt: Date;
    declare updatedAt: Date;
}

// Model
export class ModelEntity extends Model<
    InferAttributes<ModelEntity>,
    InferCreationAttributes<ModelEntity>
> {
    declare id: number;
    declare makeId: number;
    declare modelName: string;
    declare metadata: object | null;
    declare createdAt: Date;
    declare updatedAt: Date;
}

// Alert
export class Alert extends Model<InferAttributes<Alert>, InferCreationAttributes<Alert>> {
    declare id: number;
    declare userId: number;
    declare vehicleId: number;
    declare serviceItemId: number | null;
    declare dueDate: Date | null;
    declare status: string;
    declare message: string | null;
    declare acknowledged: boolean;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export function initModels(sequelize: Sequelize) {
    User.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, unique: true },
            email: { type: DataTypes.STRING, allowNull: false, unique: true },
            passwordHash: { type: DataTypes.STRING, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: true },
            location: { type: DataTypes.STRING, allowNull: true },
            createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        },
        { sequelize, tableName: "users", timestamps: true }
    );

    Vehicle.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, unique: true },
            userId: { type: DataTypes.INTEGER, allowNull: false },
            nickname: { type: DataTypes.STRING, allowNull: true },
            year: { type: DataTypes.INTEGER, allowNull: true },
            makeId: { type: DataTypes.INTEGER, allowNull: true },
            modelId: { type: DataTypes.INTEGER, allowNull: true },
            vin: { type: DataTypes.STRING, allowNull: true },
            mileage: { type: DataTypes.INTEGER, allowNull: true },
            createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        },
        { sequelize, tableName: "vehicles", timestamps: true }
    );

    ServiceRecord.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            uuid: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4, unique: true },
            vehicleId: { type: DataTypes.INTEGER, allowNull: false },
            serviceItemId: { type: DataTypes.INTEGER, allowNull: false },
            performedAt: { type: DataTypes.DATE, allowNull: true },
            odometer: { type: DataTypes.INTEGER, allowNull: true },
            notes: { type: DataTypes.TEXT, allowNull: true },
            serviceLocation: { type: DataTypes.STRING, allowNull: true },
            productName: { type: DataTypes.STRING, allowNull: true },
            cost: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
            interval: { type: DataTypes.INTEGER, allowNull: true },
            createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        },
        { sequelize, tableName: "service_records", timestamps: true }
    );

    ServiceItem.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            itemType: { type: DataTypes.STRING, allowNull: false, unique: true },
            recommendedInterval: { type: DataTypes.INTEGER, allowNull: true },
            createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        },
        { sequelize, tableName: "service_items", timestamps: true }
    );

    Make.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            makeName: { type: DataTypes.STRING, allowNull: false, unique: true },
            metadata: { type: DataTypes.JSON, allowNull: true },
            createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        },
        { sequelize, tableName: "makes", timestamps: true }
    );

    ModelEntity.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            makeId: { type: DataTypes.INTEGER, allowNull: false },
            modelName: { type: DataTypes.STRING, allowNull: false },
            metadata: { type: DataTypes.JSON, allowNull: true },
            createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        },
        { sequelize, tableName: "models", timestamps: true }
    );

    Alert.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: { type: DataTypes.INTEGER, allowNull: false },
            vehicleId: { type: DataTypes.INTEGER, allowNull: false },
            serviceItemId: { type: DataTypes.INTEGER, allowNull: true },
            dueDate: { type: DataTypes.DATE, allowNull: true },
            status: { type: DataTypes.STRING, allowNull: false },
            message: { type: DataTypes.TEXT, allowNull: true },
            acknowledged: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        },
        { sequelize, tableName: "alerts", timestamps: true }
    );

    // Associations (minimal for now; can be expanded in later steps)
    User.hasMany(Vehicle, { foreignKey: "userId", onDelete: "CASCADE" });
    Vehicle.belongsTo(User, { foreignKey: "userId" });

    Vehicle.hasMany(ServiceRecord, { foreignKey: "vehicleId", onDelete: "CASCADE" });
    ServiceRecord.belongsTo(Vehicle, { foreignKey: "vehicleId" });

    ServiceItem.hasMany(ServiceRecord, { foreignKey: "serviceItemId" });
    ServiceRecord.belongsTo(ServiceItem, { foreignKey: "serviceItemId" });

    Make.hasMany(ModelEntity, { foreignKey: "makeId" });
    ModelEntity.belongsTo(Make, { foreignKey: "makeId" });

    Vehicle.belongsTo(Make, { foreignKey: "makeId" });
    Vehicle.belongsTo(ModelEntity, { foreignKey: "modelId" });

    User.hasMany(Alert, { foreignKey: "userId", onDelete: "CASCADE" });
    Vehicle.hasMany(Alert, { foreignKey: "vehicleId", onDelete: "CASCADE" });
    ServiceItem.hasMany(Alert, { foreignKey: "serviceItemId" });
    Alert.belongsTo(User, { foreignKey: "userId" });
    Alert.belongsTo(Vehicle, { foreignKey: "vehicleId" });
    Alert.belongsTo(ServiceItem, { foreignKey: "serviceItemId" });
}

