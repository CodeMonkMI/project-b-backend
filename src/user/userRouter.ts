import express, { Router } from "express";
import { authenticate, isAdmin, isSuperAdmin } from "../auth/authMiddleware";
import { errorResponse } from "../helpers/errorResponses";
import {
  all,
  create,
  demote,
  getRoles,
  promote,
  remove,
  removeConfirm,
  single,
  update,
  verify,
} from "./userController";
import { createNewValidator, promoteDemoteValidator } from "./userValidator";

const authRouter: Router = express.Router();
authRouter.use(authenticate);
authRouter.get("/", isAdmin, all);
authRouter.get("/roles", isSuperAdmin, getRoles);
authRouter.patch("/verify/:username", isSuperAdmin, verify);
authRouter.post(
  "/create",
  isSuperAdmin,
  createNewValidator,
  errorResponse,
  create
);
authRouter.get("/single/:username", isSuperAdmin, single);
authRouter.patch("/single/:id", isSuperAdmin, update);
authRouter.delete("/remove/:username", isSuperAdmin, remove);
authRouter.delete("/remove/:username/confirm", isSuperAdmin, removeConfirm);
authRouter.post("/promote", isSuperAdmin, promoteDemoteValidator, promote);
authRouter.post("/demote", isSuperAdmin, promoteDemoteValidator, demote);

export default authRouter;
