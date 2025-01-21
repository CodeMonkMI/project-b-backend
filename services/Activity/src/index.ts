import { createActivity, getActivity } from "@/controllers";
import cors from "cors";
import express, { Express, Response } from "express";
import morgan from "morgan";
import generateAuthUser from "./middleware/generateAuthUser";

const app: Express = express();

// basic middlewares
app.use(cors({ origin: true }));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(generateAuthUser);

// health route
app.get("/health", (_req, res: Response) => {
  try {
    return res.status(200).json({ message: "UP" });
  } catch (e) {
    return res.status(500).json({ message: "DOWN" });
  }
});
// create routes
app.get("/activity", getActivity);
app.post("/activity", createActivity);

// 404 not found handler
app.use((_req, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

// 500 internal server error handler
app.use((err: any, _req: any, res: Response, _next: any) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5004;
const SERVICE_NAME = process.env.SERVICE_NAME || "Activity Service";
app.listen(PORT, () => {
  console.log(`${SERVICE_NAME}  is running on port ${PORT}`);
});
