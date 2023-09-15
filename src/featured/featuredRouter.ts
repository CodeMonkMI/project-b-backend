import express, { Router } from "express";
import { authenticate } from "../auth/authMiddleware";
import { errorResponse } from "../helpers/errorResponses";
import { all, create, remove, single, update } from "./featuredController";
import { createValidator, updateValidator } from "./featuredValidator";

const featuredRouter: Router = express.Router();
featuredRouter.get("/", authenticate, all);
featuredRouter.post("/", authenticate, createValidator, errorResponse, create);
featuredRouter.get("/:id", authenticate, single);
featuredRouter.patch(
  "/:id",
  authenticate,
  updateValidator,
  errorResponse,
  update
);
featuredRouter.delete("/:id", authenticate, remove);

export default featuredRouter;
