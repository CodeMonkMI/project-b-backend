import express, { Router } from "express";
import { authenticate } from "../auth/authMiddleware";
import { all } from "./notificationController";

const notificationRouter: Router = express.Router();
notificationRouter.get("/", authenticate, all);

export default notificationRouter;
