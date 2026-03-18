import type { CreationAttributes, ModelStatic } from "sequelize";
import { BaseRepository } from "./base-repository";
import { User } from "../models";

export class UserRepository extends BaseRepository<User> {
    constructor(model: ModelStatic<User> = User) {
        super(model);
    }

    createUser(attrs: CreationAttributes<User>): Promise<User> {
        return this.model.create(attrs);
    }

    findByEmail(email: string): Promise<User | null> {
        return this.model.findOne({ where: { email } });
    }

    listUsers(): Promise<User[]> {
        return this.listAll();
    }

    async updateUser(id: number, attrs: Partial<CreationAttributes<User>>): Promise<User | null> {
        const user = await this.findById(id);
        if (!user) return null;

        return user.update(attrs);
    }
}

