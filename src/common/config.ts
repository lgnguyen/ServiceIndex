/**
 * Centralized config read from process.env (populated by dotenv from .env).
 * The rest of the app should use this class instead of reading process.env directly.
 */

const DEFAULT_PORT = 8000;
const DEFAULT_DATABASE_PATH = "./database.db";
const DEFAULT_NODE_ENV = "development";

export class Config {
    private readonly env: NodeJS.ProcessEnv;

    // Environment variables
    private readonly port: number;
    private readonly databasePath: string;
    private readonly nodeEnv: string;
    private readonly secretKey: string;

    constructor(env: NodeJS.ProcessEnv = process.env) {
        this.env = env;

        this.port = Number(this.getEnvVar("PORT", DEFAULT_PORT.toString()));
        this.databasePath = this.getEnvVar("DATABASE_PATH", DEFAULT_DATABASE_PATH);
        this.nodeEnv = this.getEnvVar("NODE_ENV", DEFAULT_NODE_ENV);
        this.secretKey = this.getEnvVar("SECRET_KEY");

        // Validate environment variables
        if (this.port <= 0 || this.port > 65535) {
            throw new Error("PORT must be between 1 and 65535");
        }
    }

    /**
   * Returns the value of an environment variable, or the default if provided.
   * If no default is given and the variable is missing or empty, throws.
   */
    getEnvVar(envVarName: string, defaultValue?: string): string {
        const value = this.env[envVarName];
        const present = value !== undefined && value !== "";
        if (present) return value;
        if (defaultValue !== undefined) return defaultValue;
        throw new Error(
            `${envVarName} environment variable not set, please add it to .env`
        );
    }

    getSecretKey(): string {
        return this.secretKey;
    }

    getPort(): number {
        return this.port;
    }

    getNodeEnv(): string {
        return this.nodeEnv;
    }

    getDatabasePath(): string {
        return this.databasePath;
    }
}