import type { CreationAttributes, ModelStatic } from "sequelize";
import { BaseRepository } from "./base-repository";
import { Make } from "../models";

export class MakeRepository extends BaseRepository<Make> {
    constructor(model: ModelStatic<Make> = Make) {
        super(model);
    }

    createMake(attrs: CreationAttributes<Make>): Promise<Make> {
        return this.model.create(attrs);
    }

    findByName(name: string): Promise<Make | null> {
        return this.model.findOne({ where: { name } });
    }

    listMakes(): Promise<Make[]> {
        return this.listAll();
    }
}

