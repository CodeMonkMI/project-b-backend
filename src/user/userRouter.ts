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
import { createNewValidator, promoteDemoteValidator } from "./userValidator";

const authRouter: Router = express.Router();
authRouter.get("/", authenticate, all);
authRouter.post("/", createNewValidator, errorResponse, create);
authRouter.get("/:username", single);
authRouter.patch("/:id", update);
authRouter.delete("/remove/:username", remove);
authRouter.delete("/remove/:username/confirm", removeConfirm);
authRouter.post("/promote", promoteDemoteValidator, promote);
authRouter.post("/demote", promoteDemoteValidator, demote);

export default authRouter;
