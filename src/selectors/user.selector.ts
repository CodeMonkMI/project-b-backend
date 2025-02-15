import { Prisma } from "@prisma/client";
export class UserSelector {
  private defaultSelector: Prisma.UserSelect = {
    email: true,
    username: true,
    password: true,
    id: true,
    isVerified: true,
    isDelete: true,
  };
  get default() {
    return this.defaultSelector;
  }
  get role(): Prisma.RoleSelect {
    return {
      name: true,
      id: true,
      role: true,
    };
  }
}
