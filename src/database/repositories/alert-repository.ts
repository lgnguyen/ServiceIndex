import type { CreationAttributes, ModelStatic } from "sequelize";
import { BaseRepository } from "./base-repository";
import { Alert } from "../models";

export class AlertRepository extends BaseRepository<Alert> {
    constructor(model: ModelStatic<Alert> = Alert) {
        super(model);
    }

    createAlert(attrs: CreationAttributes<Alert>): Promise<Alert> {
        return this.model.create(attrs);
    }

    listByUserId(userId: number): Promise<Alert[]> {
        return this.model.findAll({ where: { userId } });
    }

    async updateAlert(id: number, attrs: Partial<CreationAttributes<Alert>>): Promise<Alert | null> {
        const alert = await this.findById(id);
        if (!alert) return null;

        return alert.update(attrs);
    }
}

