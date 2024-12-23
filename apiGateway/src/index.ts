import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import { configureRoutes } from "./utils";

dotenv.config();

const app: Express = express();

// basic middlewares
app.use(cors({ origin: true }));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/health", (_req, res: Response) => {
  try {
    return res.status(200).json({ message: "UP" });
  } catch (e) {
    return res.status(500).json({ message: "DOWN" });
  }
});

// add rate limiter on api requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    return res.status(429).json({
      message: "Too many requests, please try again later.",
    });
  },
});

app.use("/api", limiter);

// configure all routes
configureRoutes(app);

// not found routes
app.use((_req, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

// 500 internal server error handler
app.use((err: any, _req: any, res: Response, _next: any) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
