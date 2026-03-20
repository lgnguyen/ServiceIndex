import type { Request, Response } from "express";
import { randomBytes, scryptSync } from "node:crypto";
import { UniqueConstraintError } from "sequelize";
import type { AuthConfig } from "../validators";
import type { UserRepository } from "../../database/repositories";

interface UserResponse {
    id: number;
    uuid: string;
    email: string;
    name: string | null;
    location: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export class UsersHandler {
    constructor(
        private readonly deps?: {
            config?: AuthConfig;
            repositories?: {
                users?: UserRepository;
            };
        }
    ) {}

    private get usersRepo(): UserRepository {
        const users = this.deps?.repositories?.users;
        if (!users) {
            throw new Error("Users repository is not configured");
        }
        return users;
    }

    private sanitizeUser(user: {
        id: number;
        uuid: string;
        email: string;
        name: string | null;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
    }): UserResponse {
        return {
            id: user.id,
            uuid: user.uuid,
            email: user.email,
            name: user.name,
            location: user.location,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    private hashPassword(password: string): string {
        const salt = randomBytes(16).toString("hex");
        const hash = scryptSync(password, salt, 64).toString("hex");
        return `scrypt$${salt}$${hash}`;
    }

    /** POST /users — create user. */
    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const body = req.body as { email: string; password: string; name?: string };
            const createdUser = await this.usersRepo.createUser({
                email: body.email.toLowerCase(),
                passwordHash: this.hashPassword(body.password),
                name: body.name ?? null,
                location: null,
            });
            res.status(201).json(this.sanitizeUser(createdUser));
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                res.status(409).json({
                    error: {
                        code: 409,
                        type: "Conflict",
                        message: "User with this email already exists",
                    },
                });
                return;
            }
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to create user",
                },
            });
        }
    }

    /** GET /users/:userId — get current user. */
    async getCurrentUser(req: Request, res: Response): Promise<void> {
        const userId = Number(req.params.userId);
        if (!Number.isInteger(userId) || userId <= 0) {
            res.status(400).json({
                error: {
                    code: 400,
                    type: "BadRequest",
                    message: "Invalid userId path parameter",
                },
            });
            return;
        }

        try {
            const user = await this.usersRepo.findById(userId);
            if (!user) {
                res.status(404).json({
                    error: {
                        code: 404,
                        type: "NotFound",
                        message: "User not found",
                    },
                });
                return;
            }
            res.status(200).json(this.sanitizeUser(user));
        } catch {
            res.status(500).json({
                error: {
                    code: 500,
                    type: "InternalServerError",
                    message: "Failed to fetch user",
                },
            });
        }
    }
}
