import { Prisma } from "@prisma/client";

export type ID = string | number;

export type IBaseService<TDelegate> = {
  find(
    where?: Prisma.Args<TDelegate, "findMany">["data"]
  ): Promise<
    Prisma.Result<
      TDelegate,
      { where: Prisma.Args<TDelegate, "findMany">["data"] },
      "findMany"
    >
  >;
  findOne(
    where?: Prisma.Args<TDelegate, "findFirst">["data"]
  ): Promise<
    Prisma.Result<
      TDelegate,
      { where: Prisma.Args<TDelegate, "findFirst">["data"] },
      "findFirst"
    >
  >;
  findByID(
    where?: Prisma.Args<TDelegate, "findUnique">["data"]
  ): Promise<
    Prisma.Result<
      TDelegate,
      { where: Prisma.Args<TDelegate, "findUnique">["data"] },
      "findUnique"
    >
  >;
  create(
    data: Prisma.Args<TDelegate, "create">["data"]
  ): Promise<
    Prisma.Result<
      TDelegate,
      { data: Prisma.Args<TDelegate, "create">["data"] },
      "create"
    >
  >;
  update(
    id: ID,
    data: Prisma.Args<TDelegate, "update">["data"]
  ): Promise<
    Prisma.Result<
      TDelegate,
      { data: Prisma.Args<TDelegate, "update">["data"] },
      "update"
    >
  >;
  delete(id: ID): Promise<Prisma.Result<TDelegate, { id: ID }, "delete">>;
};
