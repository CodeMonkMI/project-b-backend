import express, { Router } from "express";
import { authenticate } from "../auth/authMiddleware";
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
donationRequestRouter.get("/", authenticate, all);
donationRequestRouter.post(
  "/",
  authenticate,
  createValidator,
  errorResponse,
  create
);
donationRequestRouter.get("/:id", authenticate, single);
donationRequestRouter.patch(
  "/:id",
  authenticate,
  updateValidator,
  errorResponse,
  update
);
donationRequestRouter.delete("/:id", authenticate, remove);

export default donationRequestRouter;
