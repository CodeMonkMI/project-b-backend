import { Prisma, PrismaClient } from "@prisma/client";
import { DatabaseClientPool } from "../../db/DatabaseClientPool";
import { IBaseRepository, ID, Options } from "./IBaseRepository";

// Update the BaseRepository class definition to include the delegate type
export abstract class BaseRepository<
  TDelegate,
  TModalKey extends keyof PrismaClient = keyof PrismaClient
> implements IBaseRepository<TDelegate>
{
  constructor(
    private readonly database: DatabaseClientPool,
    private readonly modelKey: TModalKey
  ) {}

  async findAll(
    options?: Options<TDelegate>
  ): Promise<
    Prisma.Result<TDelegate, { options?: Options<TDelegate> }, "findMany">
  > {
    return this.database.executeQuery("Find All", async (db: PrismaClient) => {
      const modelDelegate = db[this.modelKey] as any;

      return modelDelegate.findMany(options);
    });
  }
  findOne(
    options?: Options<TDelegate>
  ): Promise<
    Prisma.Result<
      TDelegate,
      { where: Prisma.Args<TDelegate, "findFirst">["data"] },
      "findFirst"
    >
  > {
    return this.database.executeQuery("Find One", (db: PrismaClient) => {
      const modelDelegate = db[this.modelKey] as any;
      return modelDelegate.findFirst(options);
    });
  }
  findById(
    id: ID
  ): Promise<
    Prisma.Result<
      TDelegate,
      { where: Prisma.Args<TDelegate, "findUnique">["data"] },
      "findUnique"
    >
  > {
    return this.database.executeQuery("Find By Id", (db: PrismaClient) => {
      const modelDelegate = db[this.modelKey] as any;
      return modelDelegate.findFirst({
        where: {
          id,
        },
      });
    });
  }
  async findAndCount(
    options?: Options<TDelegate>
  ): Promise<
    [
      Prisma.Result<
        TDelegate,
        { where?: Prisma.Args<TDelegate, "findMany">["where"] },
        "findMany"
      >,
      number
    ]
  > {
    return this.database.executeQuery(
      "Find and Count",
      async (db: PrismaClient) => {
        const modelDelegate = db[this.modelKey] as any;

        const data = modelDelegate.findFirst(options);
        const count = await this.count(options);
        return [data, count];
      }
    );
  }

  count(options?: Options<TDelegate>): Promise<number> {
    return this.database.executeQuery("Count", (db: PrismaClient) => {
      const modelDelegate = db[this.modelKey] as any;

      return modelDelegate.count(options);
    });
  }

  // mutation: create
  create(
    data: Prisma.Args<TDelegate, "create">["data"],
    select: Options<TDelegate>["select"]
  ): Promise<any> {
    return this.database.executeQuery("Create", (db: PrismaClient) => {
      const modelDelegate = db[this.modelKey] as any;
      return modelDelegate.create({
        data,
        select,
      });
    });
  }
  createMany(
    data: Prisma.Args<TDelegate, "create">["data"][],
    select: Options<TDelegate>["select"]
  ): Promise<any[]> {
    return this.database.executeQuery("Create Many", (db: PrismaClient) => {
      const modelDelegate = db[this.modelKey] as any;
      return modelDelegate.createMany({
        data,
        select,
      });
    });
  }

  // mutation: update
  update(
    id: ID,
    data: Prisma.Args<TDelegate, "update">["data"],
    select: Options<TDelegate>["select"]
  ): Promise<
    Prisma.Result<
      TDelegate,
      { data: Prisma.Args<TDelegate, "update">["data"] },
      "update"
    >
  > {
    return this.database.executeQuery("Update", (db: PrismaClient) => {
      const modelDelegate = db[this.modelKey] as any;
      return modelDelegate.update({
        where: {
          id,
        },
        data,
        select,
      });
    });
  }
  updateMany(
    where: Prisma.Args<TDelegate, "findMany">["where"],
    data: Prisma.Args<TDelegate, "update">["data"][],
    select: Options<TDelegate>["select"]
  ): Promise<TDelegate[]> {
    return this.database.executeQuery("Update Many", (db: PrismaClient) => {
      const modelDelegate = db[this.modelKey] as any;
      return modelDelegate.updateMany({
        where,
        data,
        select,
      });
    });
  }

  // mutation: delete
  delete(id: ID): Promise<Prisma.Result<TDelegate, { id: ID }, "delete">> {
    return this.database.executeQuery("Delete", (db: PrismaClient) => {
      const modelDelegate = db[this.modelKey] as any;
      return modelDelegate.delete({
        where: {
          id,
        },
      });
    });
  }
  deleteMany(
    ids: ID[]
  ): Promise<Prisma.Result<TDelegate, { ids: ID[] }, "deleteMany">> {
    return this.database.executeQuery("Delete Many", (db: PrismaClient) => {
      const modelDelegate = db[this.modelKey] as any;
      return modelDelegate.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
    });
  }

  checkExists(options?: Options<TDelegate>): Promise<boolean> {
    return this.database.executeQuery(
      "Check Exists",
      async (db: PrismaClient) => {
        const modelDelegate = db[this.modelKey] as any;

        const data = await modelDelegate.findFirst(options);
        return !!data;
      }
    );
  }
}
