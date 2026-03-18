import type { CreationAttributes, ModelStatic } from "sequelize";
import { BaseRepository } from "./base-repository";
import { ServiceRecord } from "../models";

export class ServiceRecordRepository extends BaseRepository<ServiceRecord> {
    constructor(model: ModelStatic<ServiceRecord> = ServiceRecord) {
        super(model);
    }

    createServiceRecord(attrs: CreationAttributes<ServiceRecord>): Promise<ServiceRecord> {
        return this.model.create(attrs);
    }

    listByVehicleId(vehicleId: number): Promise<ServiceRecord[]> {
        return this.model.findAll({ where: { vehicleId } });
    }

    async updateServiceRecord(
        id: number,
        attrs: Partial<CreationAttributes<ServiceRecord>>
    ): Promise<ServiceRecord | null> {
        const serviceRecord = await this.findById(id);
        if (!serviceRecord) return null;

        return serviceRecord.update(attrs);
    }
}

