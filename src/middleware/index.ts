import cors from "cors";
import express, { Express } from "express";
import morgan from "morgan";
import passport from "passport";
import authMiddleware from "../auth/authMiddleware";

const middleware = [
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
  morgan("dev"),
  express.urlencoded({ extended: true }),
  express.json(),
];

const setUpMiddleware = (app: Express) => {
  middleware.forEach((item) => {
    app.use(item);
  });

  app.use(passport.initialize());

  authMiddleware(passport);
};

export default setUpMiddleware;
