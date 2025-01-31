import { PrismaClient } from "@prisma/client";

export interface IDatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getClient(): PrismaClient;
  isConnected(): boolean;
  executeQuery<T>(
    label: string,
    queryFn: (db: PrismaClient) => Promise<T>
  ): Promise<T>;
}

export type DatabaseConfig = {
  url: string;
  maxConnection?: number;
  idleTimeout?: number;
  connectionTimeout?: number;
  maxUses?: number;
  ssl?: boolean;
};
