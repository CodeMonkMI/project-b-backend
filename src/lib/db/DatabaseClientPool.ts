import { PrismaClient } from "@prisma/client";
import { Client, IDatabase } from "./IDatabaseClient";

export class DatabaseClientPool implements IDatabase {
  private isConnect = false;
  private prisma: PrismaClient = new PrismaClient();
  constructor() {
    this.connect();
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      this.isConnect = true;
    } catch (error) {
      console.log("Failed to connect to database", error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      this.isConnect = false;
    } catch (error) {
      console.log("Failed to disconnect to database", error);
    }
  }

  getClient() {
    if (!this.isConnect) {
      throw new Error("Database is not connected");
    }
    return this.prisma;
  }

  isConnected(): boolean {
    return this.isConnect;
  }

  async executeQuery<T>(
    label: string,
    queryFn: (db: Client) => Promise<T>
  ): Promise<T> {
    const start = performance.now();

    try {
      const result = await queryFn(this.prisma);
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
