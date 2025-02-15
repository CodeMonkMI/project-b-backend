import { PrismaClient } from "@prisma/client";

export class StringHelper {
  constructor(private readonly prisma: PrismaClient) {}
  static generateUsername(name: string): string {
    const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    const username = `${name}${randomNumber}`;

    return username.replace(" ", "_");
  }
  async generateUniqueUser(
    firstName: string,
    lastName: string
  ): Promise<string> {
    let username = StringHelper.generateUsername(firstName + " " + lastName);
    while (true) {
      const data = await this.prisma.user.findFirst({
        where: { username },
      });
      if (!data) {
        break;
      }
      username = StringHelper.generateUsername(firstName + " " + lastName);
    }
    return username;
  }
  static generateOtpVerificationId(): string {
    return Math.random().toString(36).substring(2, 22);
  }
}
