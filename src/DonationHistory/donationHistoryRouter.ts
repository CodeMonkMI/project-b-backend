import express, { Router } from "express";
import { authenticate } from "../auth/authMiddleware";
import { all, remove, single } from "./donationHistoryController";

const donationHistoryRouter: Router = express.Router();
donationHistoryRouter.get("/", authenticate, all);
donationHistoryRouter.get("/:id", authenticate, single);
donationHistoryRouter.delete("/:id", authenticate, remove);

export default donationHistoryRouter;
