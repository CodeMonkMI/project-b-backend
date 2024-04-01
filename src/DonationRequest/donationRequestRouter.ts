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
  approve,
  create,
  holdStatus,
  nextStatus,
  prevStatus,
  remove,
  single,
  update,
} from "./donationRequestController";
import { requestFinder } from "./donationRequestMiddleware";
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
donationRequestRouter.put("/approve/:id", isAdmin, approve);
donationRequestRouter.put(
  "/status/prev/:id",
  isAdmin,
  requestFinder,
  prevStatus
);
donationRequestRouter.put(
  "/status/next/:id",
  isAdmin,
  requestFinder,
  nextStatus
);
donationRequestRouter.put("/status/hold/:id", isAdmin, holdStatus);
donationRequestRouter.patch(
  "/:id",
  isAdmin,
  updateValidator,
  errorResponse,
  update
);
donationRequestRouter.delete("/:id", isSuperAdmin, remove);

export default donationRequestRouter;
