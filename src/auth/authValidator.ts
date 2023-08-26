import { PrismaClient } from "@prisma/client";
import { body } from "express-validator";
import { BLOOD_GROUPS } from "./authHelpers";

const prisma = new PrismaClient();

const validator = {
  signInValidator: [
    body("username").not().isEmpty().withMessage("Username is required!"),
    body("password").not().isEmpty().withMessage("Password is required!"),
  ],

  nameValidator: [
    body("name")
      .not()
      .isEmpty()
      .withMessage("Please enter a name")
      .isLength({ min: 4, max: 50 })
      .withMessage("Please enter a name between 4 to 50 chars")
      .trim(),
  ],
  passwordUpdateValidator: [
    body("oldPassword").not().isEmpty().withMessage("Old password is required"),
    body("newPassword")
      .not()
      .isEmpty()
      .withMessage("New password is required")
      .isLength({ min: 8, max: 32 })
      .withMessage("Old password must be chars between 8 to 32"),
    body("confirmPassword")
      .not()
      .isEmpty()
      .withMessage("Confirm password is required")
      .isLength({ min: 8, max: 32 })
      .withMessage("Confirm password must be chars between 8 to 32")
      .custom(async (confirmPassword, { req }) => {
        const { newPassword } = req.body;

        if (newPassword !== confirmPassword) {
          throw new Error("Password didn't match!");
        }

        return true;
      }),
  ],
};

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

  body("username")
    .not()
    .isEmpty()
    .withMessage("Username is required!")
    .custom(async (username) => {
      const userData = await prisma.user.findUnique({
        where: { username, isDelete: false },
      });
      console.log(userData);
      if (userData) throw new Error("Username is already exists!");
      return true;
    }),
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
