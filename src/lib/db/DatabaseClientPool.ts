import { PrismaClient } from "@prisma/client";
import { IDatabaseClient } from "./IDatabaseClient";

export class DatabaseClientPool implements IDatabaseClient {
  private client: PrismaClient | null = null;

  private connected: boolean = false;

  async connect(): Promise<void> {
    if (!this.client) {
      const prisma = new PrismaClient();
      this.client = prisma;
      await prisma.$connect();
      this.connected = true;
      console.log(`Connected to database`);
    }
  }
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.$disconnect();
      this.client = null;
      this.connected = false;
    }
    console.log(`Disconnected from database`);
  }
  getClient(): PrismaClient {
    if (this.client && this.connected) {
      return this.client;
    }
    throw new Error("Database is not connected!");
  }
  isConnected(): boolean {
    return this.connected;
  }
  async executeQuery<T>(
    label: string,
    queryFn: (db: PrismaClient) => Promise<T>
  ): Promise<T> {
    if (!this.connected) {
      throw new Error("Database is not connected!");
    }
    const start = performance.now();

    try {
      const result = await queryFn(this.client!);
      const duration = performance.now() - start;

      console.log(`[${label}] completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`[${label}] failed in ${duration.toFixed(2)}ms`);
      console.log(error);

      throw new Error(`[${label}] Database query failed`);
    }
  }
}

function main() {
  const db = new DatabaseClientPool();
  db.connect().then(() => {
    db.executeQuery("fetch", (db) => {
      const data = db.user.findMany({
        take: 1,
      });

      return data;
    })
      .then((d) => {
        console.log(d);
      })
      .catch((e) => {
        console.log(e);
      });
  });
}

main();
