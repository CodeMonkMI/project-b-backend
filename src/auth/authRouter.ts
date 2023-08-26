import express, { Router } from "express";
import { errorResponse } from "../helpers/errorResponses";
import {
  forgotPassword,
  me,
  recoverAccount,
  signIn,
  signUp,
  updatePassword,
} from "./authController";
import { signInValidator, signUpValidator } from "./authValidator";

const authRouter: Router = express.Router();
authRouter.post("/sign-in", signInValidator, errorResponse, signIn);
authRouter.post("/sign-up", signUpValidator, errorResponse, signUp);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/recover-password", recoverAccount);
authRouter.patch("/update-password", updatePassword);
authRouter.post("/me", me);

export default authRouter;
