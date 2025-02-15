import cors from "cors";
import express, { Express } from "express";
import passport from "passport";
import authMiddleware from "./auth/authMiddleware";
import setRoutes from "./routes";

export const createApp = () => {
  const app: Express = express();
  // necessary middleware

  app.use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  );
  // app.use(morgan("dev"));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // middleware setup for passport
  app.use(passport.initialize());
  authMiddleware(passport);

  // register controller here

  setRoutes(app);

  return app;
};
