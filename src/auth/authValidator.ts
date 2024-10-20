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

export const updatePasswordValidator = [
  body("password")
    .not()
    .isEmpty()
    .withMessage("Current password is required!")
    .isLength({ min: 8 })
    .withMessage("Current password must be at least 8 chars"),
  body("newPassword")
    .not()
    .isEmpty()
    .withMessage("New password is required!")
    .isLength({ min: 8, max: 32 })
    .withMessage("New password must be between 8 and 32 chars"),
  body("confirmPassword")
    .not()
    .isEmpty()
    .withMessage("Confirm password is required!")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords did not match");
      }
      return true;
    }),
];

export const updateInfoValidator = [
  body("email")
    .not()
    .isEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Email must be valid!")
    .custom(async (email, { req }) => {
      const userData = await prisma.user.findUnique({
        where: { email, isDelete: false, NOT: { id: req.user.id } },
      });
      if (userData) throw new Error("Email is already exists!");
      return true;
    })
    .normalizeEmail(),
];

export const updateProfileValidator = [
  body("firstName")
    .not()
    .isEmpty()
    .withMessage("First name is required!")
    .isLength({ max: 50 })
    .withMessage("First name must be less than 50 chars!"),
  body("lastName")
    .not()
    .isEmpty()
    .withMessage("Last name is required!")
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 chars!"),
  body("displayName")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Display name must be less than 50 chars!"),
  body("fatherName")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Father name must be less than 50 chars!"),
  body("motherName")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Mother name must be less than 50 chars!"),
  body("streetAddress")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Street address must be less than 100 chars!"),
  body("phoneNo")
    .optional()
    .isLength({ max: 15 })
    .withMessage("Phone number must be less than 15 chars!"),
];

export const recoverAccountValidator = [
  body("email")
    .isString()
    .withMessage("Email or Username must be a string")
    .notEmpty()
    .custom(async (email, { req }) => {
      const userData = await prisma.user.findFirst({
        where: {
          OR: [{ email: email }, { username: email }],
        },
      });
      if (!userData)
        throw new Error("We didn't find any info with your given info");

      await prisma.otpRecords.deleteMany({
        where: {
          email,
        },
      });
      req.user = userData;
      return true;
    }),
];

export const verifyOtpValidator = [
  body("otp")
    .isString()
    .withMessage("OTP must be a string")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .custom(async (_, { req }) => {
      const otpRecord = await prisma.otpRecords.findFirst({
        where: {
          email: req.email,
          expiresAt: {
            gte: new Date(),
          },
        },
      });
      if (!otpRecord) {
        throw new Error(" Invalid OTP");
      }
      req.otpRecordId = otpRecord.id;
      return true;
    }),
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .notEmpty()
    .withMessage("Email is required"),
];

export const setNewPasswordValidator = [
  body("newPassword")
    .isLength({ min: 6, max: 32 })
    .withMessage("New password must be between 6 and 32 characters"),
  body("confirmPassword")
    .isString()
    .withMessage("Confirm password is required")
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];
