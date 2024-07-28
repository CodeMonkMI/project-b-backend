import express, { Router } from "express";
import { authenticate } from "../auth/authMiddleware";
import { all, remove, single } from "./donationActivityController";

const donationActivityRouter: Router = express.Router();
donationActivityRouter.get("/", authenticate, all);
donationActivityRouter.get("/:id", authenticate, single);
donationActivityRouter.delete("/:id", authenticate, remove);

export default donationActivityRouter;
