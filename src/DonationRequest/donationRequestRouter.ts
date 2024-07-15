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
  assign,
  create,
  decline,
  findDonor,
  hold,
  progress,
  remove,
  single,
} from "./donationRequestController";
import {
  assignValidator,
  createValidator,
  donorFinderValidator,
} from "./donationRequestValidator";

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
donationRequestRouter.put("/decline/:id", isAdmin, decline);
donationRequestRouter.put("/progress/:id", isAdmin, progress);

donationRequestRouter.put("/hold/:id", isAdmin, hold);
donationRequestRouter.put(
  "/assign/:id",
  isAdmin,
  assignValidator,
  errorResponse,
  assign
);
donationRequestRouter.delete("/:id", isSuperAdmin, remove);
donationRequestRouter.post(
  "/find-donor",
  isAdmin,
  donorFinderValidator,
  errorResponse,
  findDonor
);

export default donationRequestRouter;
