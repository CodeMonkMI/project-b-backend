import { container } from "tsyringe";
import { DatabaseClientPool } from "./db/DatabaseClientPool";
import { DatabaseClientToken } from "./db/IDatabaseClient";

export async function resolveDependencies() {
  try {
    const databaseClientPool = new DatabaseClientPool();

    container.register(DatabaseClientToken, {
      useValue: databaseClientPool,
    });
  } catch (error) {
    console.log(`[registry] failed to resolve dependencies`, error);
  }
}
