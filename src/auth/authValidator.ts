import { PrismaClient } from "@prisma/client";
import { body } from "express-validator";
import { BLOOD_GROUPS } from "./authHelpers";

const prisma = new PrismaClient();

export const signInValidator = [
  body("username").not().isEmpty().withMessage("Username is required!"),
  body("password").not().isEmpty().withMessage("Password is required!"),
];

export const signUpValidator = [
  body("firstName")
    .not()
    .isEmpty()
    .withMessage("Full Name is required!")
    .isLength({ max: 50 })
    .withMessage("Full name must be less than 50 chars!")
    .trim(),
  body("lastName")
    .not()
    .isEmpty()
    .withMessage("Full Name is required!")
    .isLength({ max: 50 })
    .withMessage("Full name must be less than 50 chars!")
    .trim(),
  body("email")
    .not()
    .isEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Email must be valid!")
    .custom(async (email) => {
      const userData = await prisma.user.findUnique({
        where: { email, isDelete: false },
      });
      if (userData) throw new Error("Email is already exists!");
      return true;
    })
    .normalizeEmail(),
  body("blood")
    .not()
    .isEmpty()
    .withMessage("Blood Group is required!")
    .custom((blood, { req }) => {
      if (BLOOD_GROUPS.includes(blood.toUpperCase())) {
        req.blood = blood.toUpperCase();
        return true;
      }
      throw new Error("Invalid blood group");
    }),
  body("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 32 })
    .withMessage("Password must be between 8 to 32 chars"),
  body("confirmPassword")
    .not()
    .isEmpty()
    .withMessage("Confirm your password")
    .isLength({ min: 8, max: 32 })
    .withMessage("Confirm password must be between 8 to 32 chars")
    .custom(async (confirmPassword, { req }) => {
      if (req.body.password !== confirmPassword) {
        throw new Error("Password didn't match!");
      }

      return true;
    }),
];
