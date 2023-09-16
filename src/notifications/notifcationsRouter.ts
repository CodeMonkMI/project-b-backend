import express, { Router } from "express";
import { authenticate } from "../auth/authMiddleware";
import { all } from "./notifcationsController";

const donationHistoryRouter: Router = express.Router();
donationHistoryRouter.get("/", authenticate, all);

export default donationHistoryRouter;
