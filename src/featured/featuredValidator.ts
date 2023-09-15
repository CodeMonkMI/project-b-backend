import { PrismaClient } from "@prisma/client";
import { isAfter, isBefore } from "date-fns";
import { body } from "express-validator";

const prisma = new PrismaClient();

export const createValidator = [
  body("username")
    .not()
    .isEmpty()
    .withMessage("username is required!")
    .custom(async (username, { req }) => {
      const findUser = await prisma.user.findFirst({
        where: { username },
      });
      if (!findUser) throw new Error("Invalid username!");
      req.body.userId = findUser.id;
      return true;
    }),
  body("start").custom(async (start) => {
    if (!start) return true;
    const startDate = new Date(start);
    const now = new Date();
    if (isBefore(startDate, now)) {
      throw new Error("Start date must be a future date!");
    }

    return true;
  }),
  body("end").custom(async (end, { req }) => {
    if (!end) return true;
    const endDate = new Date(end);
    const startDate = new Date(req.body.start);
    if (!isAfter(endDate, startDate)) {
      throw new Error("End date must be bigger date than start date!");
    }

    return true;
  }),
];
export const updateValidator = [
  body("start").custom(async (start) => {
    if (!start) return true;
    const startDate = new Date(start);
    const now = new Date();
    if (isBefore(startDate, now)) {
      throw new Error("Start date must be a future date!");
    }

    return true;
  }),
  body("end").custom(async (end, { req }) => {
    if (!end) return true;
    const endDate = new Date(end);
    const startDate = new Date(req.body.start);
    if (!isAfter(endDate, startDate)) {
      throw new Error("End date must be bigger date than start date!");
    }

    return true;
  }),
];
