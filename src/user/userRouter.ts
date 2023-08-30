import express, { Router } from "express";
import { authenticate } from "../auth/authMiddleware";
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
const authRouter: Router = express.Router();
authRouter.get("/", authenticate, all);
authRouter.post("/", create);
authRouter.get("/:id", single);
authRouter.patch("/:id", update);
authRouter.delete("/remove/:id", remove);
authRouter.delete("/remove/:id/confirm", removeConfirm);
authRouter.post("/promote", promote);
authRouter.post("/demote", demote);

export default authRouter;
