import express, { Router } from "express";
import { authenticate } from "../auth/authMiddleware";
import { all } from "./activityController";

const donationHistoryRouter: Router = express.Router();
donationHistoryRouter.get("/", authenticate, all);

export default donationHistoryRouter;
