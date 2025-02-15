import { Prisma, PrismaClient } from "@prisma/client";
import { UserSelector } from "../selectors/user.selector";

export class UserRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly selector: UserSelector
  ) {}

  async findFirst(
    where: Prisma.UserWhereInput,
    select: Prisma.UserSelect = this.selector.default
  ): Promise<any> {
    const findUser = await this.prisma.user.findFirst({
      where,
      select,
    });
    return findUser;
  }
  async findUnique(where: Prisma.UserWhereUniqueInput): Promise<any> {
    const findUser = await this.prisma.user.findUnique({
      where,
      select: {
        email: true,
        username: true,
        password: true,
        id: true,
        isVerified: true,
      },
    });
    return findUser;
  }
  async create(data: Prisma.UserCreateInput): Promise<any> {
    const findUser = await this.prisma.user.create({
      data,
    });
    return findUser;
  }
  async createMany(data: Prisma.UserCreateManyInput): Promise<any> {
    const findUser = await this.prisma.user.createMany({
      data,
    });
    return findUser;
  }
  async update(id: string, data: Prisma.UserUpdateInput): Promise<any> {
    const findUser = await this.prisma.user.update({
      where: { id: id },
      data,
    });
    return findUser;
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
    const role = await this.prisma.role.findUnique({
      where,
      select,
    });
    return role;
  }
}
