import { Prisma } from "@prisma/client";

export type ID = string | number;
export type Options<TDelegate> = {
  where?: Prisma.Args<TDelegate, "findMany">["where"];
  select?: Prisma.Args<TDelegate, "findMany">["select"];
  include?: Prisma.Args<TDelegate, "findMany">["include"];
  orderBy?: Prisma.Args<TDelegate, "findMany">["orderBy"];
  skip?: number;
  take?: number;
};

export interface IBaseRepository<TDelegate> {
  findAll(options?: Options<TDelegate>): Promise<
    Prisma.Result<
      TDelegate,
      {
        where?: Prisma.Args<TDelegate, "findMany">["where"];
        select?: Prisma.Args<TDelegate, "findMany">["select"];
        include?: Prisma.Args<TDelegate, "findMany">["include"];
        orderBy?: Prisma.Args<TDelegate, "findMany">["orderBy"];
        skip?: number;
        take?: number;
      },
      "findMany"
    >
  >;
  findOne(
    where: Prisma.Args<TDelegate, "findFirst">["where"]
  ): Promise<
    Prisma.Result<
      TDelegate,
      { where: Prisma.Args<TDelegate, "findFirst">["data"] },
      "findFirst"
    >
  >;
  findById(
    id: ID
  ): Promise<
    Prisma.Result<
      TDelegate,
      { where: Prisma.Args<TDelegate, "findUnique">["data"] },
      "findUnique"
    >
  >;
  findAndCount(
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
  >;

  count(where: Prisma.Args<TDelegate, "findMany">["where"]): Promise<number>;
  checkExists(
    where: Prisma.Args<TDelegate, "findFirst">["where"]
  ): Promise<boolean>;

  // mutation: create
  // Instead of Promise<any>
  create(
    data: Prisma.Args<TDelegate, "create">["data"],
    select: Options<TDelegate>["select"]
  ): Promise<
    Prisma.Result<
      TDelegate,
      { data: Prisma.Args<TDelegate, "create">["data"] },
      "create"
    >
  >;

  // Instead of Promise<any>
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
  >;

  updateMany(
    where: Prisma.Args<TDelegate, "findMany">["where"],
    data: Prisma.Args<TDelegate, "update">["data"][],
    select: Options<TDelegate>["select"]
  ): Promise<any>;

  // mutation: delete
  delete(id: ID): Promise<Prisma.Result<TDelegate, { id: ID }, "delete">>;
  deleteMany(
    ids: ID[]
  ): Promise<Prisma.Result<TDelegate, { ids: ID[] }, "deleteMany">>;
}
