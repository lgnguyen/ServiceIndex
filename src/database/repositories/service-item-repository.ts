import type { CreationAttributes, ModelStatic } from "sequelize";
import { BaseRepository } from "./base-repository";
import { ServiceItem } from "../models";

export class ServiceItemRepository extends BaseRepository<ServiceItem> {
    constructor(model: ModelStatic<ServiceItem> = ServiceItem) {
        super(model);
    }

    createServiceItem(attrs: CreationAttributes<ServiceItem>): Promise<ServiceItem> {
        return this.model.create(attrs);
    }

    findByName(name: string): Promise<ServiceItem | null> {
        return this.model.findOne({ where: { name } });
    }

    listServiceItems(): Promise<ServiceItem[]> {
        return this.listAll();
    }
}

