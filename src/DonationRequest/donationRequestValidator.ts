import { PrismaClient } from "@prisma/client";
import { body } from "express-validator";

const prisma = new PrismaClient();

export const createValidator = [
  body("firstName").not().isEmpty().withMessage("First name is required!"),
  body("lastName").not().isEmpty().withMessage("Last name is required!"),
  body("email")
    .isEmail()
    .withMessage("Email is invalid!")
    .custom(async (email, { req }) => {
      if (!email) return true;
      const findUser = await prisma.user.findFirst({
        where: { email },
      });
      if (findUser) {
        req.body.emailUserId = findUser?.id;
      }
      return true;
    }),
  body("phone").not().isEmpty().withMessage("Phone is required!"),
  body("address").not().isEmpty().withMessage("Address is required!"),
  body("blood").not().isEmpty().withMessage("Blood is required!"),
  body("reason").not().isEmpty().withMessage("Reason is required!"),
];
export const updateValidator = [
  body("firstName").not().isEmpty().withMessage("First name is required!"),
  body("lastName").not().isEmpty().withMessage("Last name is required!"),
  body("email").isEmail().withMessage("Email must be valid!"),
  body("phone").not().isEmpty().withMessage("Phone is required!"),
  body("address").not().isEmpty().withMessage("Address is required!"),
  body("blood").not().isEmpty().withMessage("Blood is required!"),
  body("reason").not().isEmpty().withMessage("Reason is required!"),
];
