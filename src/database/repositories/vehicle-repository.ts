import type { CreationAttributes, ModelStatic } from "sequelize";
import { BaseRepository } from "./base-repository";
import { Vehicle } from "../models";

export class VehicleRepository extends BaseRepository<Vehicle> {
    constructor(model: ModelStatic<Vehicle> = Vehicle) {
        super(model);
    }

    createVehicle(attrs: CreationAttributes<Vehicle>): Promise<Vehicle> {
        return this.model.create(attrs);
    }

    listByUserId(userId: number): Promise<Vehicle[]> {
        return this.model.findAll({ where: { userId } });
    }

    async updateVehicle(
        id: number,
        attrs: Partial<CreationAttributes<Vehicle>>
    ): Promise<Vehicle | null> {
        const vehicle = await this.findById(id);
        if (!vehicle) return null;

        return vehicle.update(attrs);
    }
}

