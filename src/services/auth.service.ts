import { Prisma } from "@prisma/client";
import { UserRepository } from "../repositories/user.repository";
import { UserSelector } from "../selectors/user.selector";

export class AuthService {
  constructor(
    private readonly repository: UserRepository,
    private readonly selector: UserSelector
  ) {}

  async findFirst(
    where: Prisma.UserWhereInput,
    select: Prisma.UserSelect = this.selector.default
  ): Promise<any> {
    const user = await this.repository.findFirst(where, select);
    return user;
  }
  async findUnique(where: Prisma.UserWhereUniqueInput): Promise<any> {
    const user = await this.repository.findUnique(where);
    return user;
  }
  async create(data: Prisma.UserCreateInput): Promise<any> {
    const newUser = await this.repository.create(data);
    return newUser;
  }
  async createMany(data: Prisma.UserCreateManyInput): Promise<any> {
    const newUsers = await this.repository.createMany(data);
    return newUsers;
  }
  async update(id: string, data: Prisma.UserUpdateInput): Promise<any> {
    const updatedUser = await this.repository.update(id, data);
    return updatedUser;
  }
  async updateMany(
    data: (Prisma.UserUpdateInput & { id: string })[]
  ): Promise<any> {
    const updateAll = data.map(
      async (item: Prisma.UserUpdateInput & { id: string }) => {
        return await this.update(item.id, item);
      }
    );

    return Promise.all(updateAll);
  }

  async findUniqueRole(
    where: Prisma.RoleWhereUniqueInput,
    select: Prisma.RoleSelect = this.selector.role
  ): Promise<any> {
    const role = await this.repository.findUniqueRole(where, select);
    return role;
  }
}
