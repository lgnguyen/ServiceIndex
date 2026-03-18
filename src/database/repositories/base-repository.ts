import type { Model, ModelStatic } from "sequelize";

export class BaseRepository<T extends Model> {
    protected readonly model: ModelStatic<T>;

    constructor(model: ModelStatic<T>) {
        this.model = model;
    }

    async findById(id: number): Promise<T | null> {
        return this.model.findByPk(id);
    }

    async deleteById(id: number): Promise<boolean> {
        const deletedCount = await this.model.destroy({ where: { id } as any });
        return deletedCount > 0;
    }
}

