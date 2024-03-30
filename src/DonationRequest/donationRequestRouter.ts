import express, { Router } from "express";
import {
  authenticate,
  isAdmin,
  isAuthenticate,
  isSuperAdmin,
} from "../auth/authMiddleware";
import { errorResponse } from "../helpers/errorResponses";
import {
  all,
  create,
  remove,
  single,
  update,
} from "./donationRequestController";
import { createValidator, updateValidator } from "./donationRequestValidator";

const donationRequestRouter: Router = express.Router();
donationRequestRouter.use(authenticate);
donationRequestRouter.get("/", all);
donationRequestRouter.post(
  "/",
  createValidator,
  errorResponse,
  isAuthenticate,
  create
);
donationRequestRouter.get("/:id", single);
donationRequestRouter.patch(
  "/:id",
  isAdmin,
  updateValidator,
  errorResponse,
  update
);
donationRequestRouter.delete("/:id", isSuperAdmin, remove);

export default donationRequestRouter;
