import type { CreationAttributes, ModelStatic } from "sequelize";
import { BaseRepository } from "./base-repository";
import { ModelEntity } from "../models";

export class ModelRepository extends BaseRepository<ModelEntity> {
    constructor(model: ModelStatic<ModelEntity> = ModelEntity) {
        super(model);
    }

    createModel(attrs: CreationAttributes<ModelEntity>): Promise<ModelEntity> {
        return this.model.create(attrs);
    }

    listByMakeId(makeId: number): Promise<ModelEntity[]> {
        return this.model.findAll({ where: { makeId } });
    }

    findByNameAndMakeId(name: string, makeId: number): Promise<ModelEntity | null> {
        return this.model.findOne({ where: { name, makeId } });
    }
}

