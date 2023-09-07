import express, { Router } from "express";
import { authenticate } from "../auth/authMiddleware";
import { errorResponse } from "../helpers/errorResponses";
import {
  all,
  create,
  demote,
  promote,
  remove,
  removeConfirm,
  single,
  update,
} from "./userController";
import { createNewValidator } from "./userValidator";

const authRouter: Router = express.Router();
authRouter.get("/", authenticate, all);
authRouter.post("/", createNewValidator, errorResponse, create);
authRouter.get("/:username", single);
authRouter.patch("/:id", update);
authRouter.delete("/remove/:username", remove);
authRouter.delete("/remove/:username/confirm", removeConfirm);
authRouter.post("/promote", promote);
authRouter.post("/demote", demote);

export default authRouter;
