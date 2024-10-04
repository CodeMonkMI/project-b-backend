import express, { Router } from "express";
import { errorResponse } from "../helpers/errorResponses";
import {
  forgotPassword,
  me,
  recoverAccount,
  signIn,
  signUp,
  updateInfo,
  updatePassword,
} from "./authController";
import { authenticate } from "./authMiddleware";
import {
  signInValidator,
  signUpValidator,
  updateInfoValidator,
  updatePasswordValidator,
} from "./authValidator";

const authRouter: Router = express.Router();
authRouter.post("/sign-in", signInValidator, errorResponse, signIn);
authRouter.post("/sign-up", signUpValidator, errorResponse, signUp);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/recover-password", recoverAccount);
authRouter.put(
  "/update-password",
  authenticate,
  updatePasswordValidator,
  errorResponse,
  updatePassword
);
authRouter.put(
  "/update-info",
  authenticate,
  updateInfoValidator,
  errorResponse,
  updateInfo
);
authRouter.post("/me", authenticate, me);

export default authRouter;
