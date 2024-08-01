import { PrismaClient } from "@prisma/client";
import { body } from "express-validator";

const prisma = new PrismaClient();

const BLOOD_GROUPS = {
  A_POSITIVE: true,
  A_NEGATIVE: true,
  B_POSITIVE: true,
  B_NEGATIVE: true,
  AB_POSITIVE: true,
  AB_NEGATIVE: true,
  O_POSITIVE: true,
  O_NEGATIVE: true,
};
type bloodType =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE";

export const createNewValidator = [
  body("firstName").not().isEmpty().withMessage("First Name is required!"),
  body("lastName").not().isEmpty().withMessage("Last Name is required!"),
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
  body("blood")
    .not()
    .isEmpty()
    .withMessage("Blood group is required!")
    .custom(async (blood: bloodType) => {
      if (!BLOOD_GROUPS[blood]) throw new Error("Invalid blood group exists!");
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
          id: true,
        },
      });
      if (!findUser) throw new Error("User doesn't already exists!");

      req.body.findUserRole = findUser.role;
      req.body.findUserId = findUser.id;
      return true;
    }),
];
