import { Prisma } from "@prisma/client";
import { BaseRepository } from "../repository/BaseRepository";
import { BaseSelector } from "../selector/BaseSelector";
import { IBaseService, ID } from "./IBaseService";

export abstract class BaseService<TDelegate>
  implements IBaseService<TDelegate>
{
  constructor(
    private readonly repository: BaseRepository<TDelegate>,
    private readonly selector: BaseSelector<TDelegate>
  ) {}
  async find(
    where?: Prisma.Args<TDelegate, "findMany">["where"]
  ): Promise<
    Prisma.Result<
      TDelegate,
      { where: Prisma.Args<TDelegate, "findMany">["where"] },
      "findMany"
    >
  > {
    try {
      return this.repository.findAll({
        where,
      });
    } catch (error) {
      console.log(error);
      throw new Error(`[Base service] FindAll Fetched failed`);
    }
  }
  findOne(
    where?: Prisma.Args<TDelegate, "findFirst">["where"]
  ): Promise<
    Prisma.Result<
      TDelegate,
      { where: Prisma.Args<TDelegate, "findFirst">["where"] },
      "findFirst"
    >
  > {
    try {
      return this.repository.findOne({
        where,
        select: this.selector.findOne,
      });
    } catch (error) {
      throw new Error(`[Base service] FindAll Fetched failed `);
    }
  }
  findByID(
    id: ID
  ): Promise<Prisma.Result<TDelegate, { id: ID }, "findUnique">> {
    try {
      return this.repository.findById(id);
    } catch (error) {
      throw new Error(`[Base service] FindById - Fetched failed `);
    }
  }
  create(
    data: Prisma.Args<TDelegate, "create">["data"]
  ): Promise<
    Prisma.Result<
      TDelegate,
      { data: Prisma.Args<TDelegate, "create">["data"] },
      "create"
    >
  > {
    try {
      return this.repository.create(data, this.selector.create);
    } catch (error) {
      throw new Error(`[Base service] Create - failed `);
    }
  }
  update(
    id: ID,
    data: Prisma.Args<TDelegate, "update">["data"]
  ): Promise<
    Prisma.Result<
      TDelegate,
      { data: Prisma.Args<TDelegate, "update">["data"]; id: ID },
      "update"
    >
  > {
    try {
      return this.repository.update(id, data, this.selector.update);
    } catch (error) {
      throw new Error(`[Base service] Create - failed `);
    }
  }
  delete(id: ID): Promise<Prisma.Result<TDelegate, { id: ID }, "delete">> {
    try {
      return this.repository.delete(id);
    } catch (error) {
      throw new Error(`[Base service] Create - failed `);
    }
  }
}
