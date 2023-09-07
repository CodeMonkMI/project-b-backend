import { PrismaClient } from "@prisma/client";
import { body } from "express-validator";

const prisma = new PrismaClient();

export const createNewValidator = [
  body("username")
    .not()
    .isEmpty()
    .withMessage("Username is required!")
    .custom(async (username) => {
      const findUser = await prisma.user.findFirst({
        where: { username },
      });
      if (findUser) throw new Error("Email is already exists!");
      return true;
    }),
  body("email")
    .not()
    .isEmpty()
    .withMessage("Email is required!")
    .custom(async (email) => {
      const findUser = await prisma.user.findFirst({
        where: { email },
      });
      if (findUser) throw new Error("Email is already exists!");
      return true;
    }),
  body("role")
    .not()
    .isEmpty()
    .withMessage("Email is required!")
    .custom(async (id) => {
      const roleData = await prisma.role.findUnique({ where: { id } });
      if (!roleData) {
        throw new Error("Invalid role");
      }

      return true;
    }),
];

export const promoteDemoteValidator = [
  body("username")
    .not()
    .isEmpty()
    .withMessage("User is required!")
    .trim()
    .custom(async (username, { req }) => {
      const findUser = await prisma.user.findFirst({
        where: { OR: [{ username }, { email: username }] },
        select: {
          role: true,
        },
      });
      if (!findUser) throw new Error("User doesn't already exists!");
      req.body.findUserRole = findUser?.role;
      return true;
    }),
];
