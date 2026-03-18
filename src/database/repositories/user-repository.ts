import type { CreationAttributes } from "sequelize";
import { BaseRepository } from "./base-repository";
import { User } from "../models";

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(User);
    }

    createUser(attrs: CreationAttributes<User>): Promise<User> {
        return User.create(attrs);
    }

    findByEmail(email: string): Promise<User | null> {
        return User.findOne({ where: { email } });
    }
}

