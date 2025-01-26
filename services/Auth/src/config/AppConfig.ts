interface Authorization {
  jwtSecret: string;
  saltRound: string;
}

interface Security {
  corsOrigin: string[];
  allowedHosts?: string[];
}

interface App {
  port: number;
  url?: string;
  apiUrl?: string;
  name: string;
}

interface Database {
  dbUrl: string;
  poolSize?: number;
}

interface ServicesUrl {
  request: string;
  notification: string;
}

interface AppConfigOptions {
  app?: App;
  database?: Database;
  security?: Security;
  services: ServicesUrl;
  authorization: Authorization;
}

const requiredEnvVars = [
  "PORT",
  "APP_URL",
  "API_URL",
  "APP_NAME",
  "DATABASE_URL",
  "DATABASE_POOL_SIZE",
  "CORS_ORIGIN",
  "ALLOWED_HOSTS",
  "DONATION_REQUEST_SERVICE_URL",
  "NOTIFICATION_SERVICE_URL",
];

class Config {
  private static instance: Config | undefined;
  readonly config: AppConfigOptions;

  private constructor() {
    this.config = this.loadOptions();
  }

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private loadOptions(): AppConfigOptions {
    this.validateRequiredEnvVars();
    return {
      app: {
        port: parseInt(this.getEnv("PORT")!),
        url: this.getEnv("APP_URL"),
        apiUrl: this.getEnv("API_URL"),
        name: this.getEnv("APP_NAME")!,
      },
      database: {
        dbUrl: this.getEnv("DATABASE_URL"),
        poolSize: parseInt(this.getEnv("DATABASE_POOL_SIZE") || "5"),
      },
      security: {
        corsOrigin: this.getEnv("CORS_ORIGIN").split(","),
        allowedHosts: this.getEnv("ALLOWED_HOSTS")?.split(","),
      },
      services: {
        request: this.getEnv("DONATION_REQUEST_SERVICE_URL"),
        notification: this.getEnv("NOTIFICATION_SERVICE_URL"),
      },
      authorization: {
        jwtSecret: this.getEnv("JWT_SECRET"),
        saltRound: this.getEnv("SALT_ROUND"),
      },
    };
  }

  getEnv(key: string, required = false): string {
    const value = process.env[key];
    if (required && !value) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return value || "";
  }

  private validateRequiredEnvVars(): void {
    const missingVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
    }
  }
}

export default Config;
