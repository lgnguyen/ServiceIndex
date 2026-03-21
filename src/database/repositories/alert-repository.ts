import type { CreationAttributes, ModelStatic, WhereOptions } from "sequelize";
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

    /** Optional filters: status (exact), vehicleId. Ordered by due date then id. */
    listByUserIdPaginated(
        userId: number,
        opts: { limit: number; offset: number; status?: string; vehicleId?: number }
    ): Promise<Alert[]> {
        const where: WhereOptions<Alert> = { userId };
        if (opts.status !== undefined && opts.status !== "") {
            Object.assign(where, { status: opts.status });
        }
        if (opts.vehicleId !== undefined && Number.isInteger(opts.vehicleId)) {
            Object.assign(where, { vehicleId: opts.vehicleId });
        }
        return this.model.findAll({
            where,
            order: [
                ["dueDate", "ASC"],
                ["id", "DESC"],
            ],
            limit: opts.limit,
            offset: opts.offset,
        });
    }

    async updateAlert(id: number, attrs: Partial<CreationAttributes<Alert>>): Promise<Alert | null> {
        const alert = await this.findById(id);
        if (!alert) return null;

        return alert.update(attrs);
    }
}

