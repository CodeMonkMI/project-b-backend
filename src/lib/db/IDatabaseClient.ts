import { PrismaClient } from "@prisma/client";

export type Client = PrismaClient;

export interface IDatabase {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getClient(): Client;
  isConnected(): boolean;
  executeQuery<T>(
    label: string,
    queryFn: (db: Client) => Promise<T>
  ): Promise<T>;
}

export const DatabaseClientToken = Symbol("DatabaseClientToken");
