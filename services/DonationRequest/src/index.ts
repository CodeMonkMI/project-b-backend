import cors from "cors";
import express, { Express, Response } from "express";
import morgan from "morgan";
import {
  allRequest,
  approveRequest,
  assignRequest,
  completeRequest,
  crateRequest,
  declineRequest,
  holdRequest,
  progressRequest,
  removeRequest,
  singleRequest,
} from "./controllers";

const app: Express = express();

// basic middlewares
app.use(cors({ origin: true }));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// health route
app.get("/health", (_req, res: Response) => {
  try {
    return res.status(200).json({ message: "UP" });
  } catch (e) {
    return res.status(500).json({ message: "DOWN" });
  }
});
// todo all routes
app.get("/request/all", allRequest);
app.post("/request/create", crateRequest);
app.get("/request/details/:id", singleRequest);
app.put("/request/approve/:id", approveRequest);
app.put("/request/complete/:id", completeRequest);
app.put("/request/decline/:id", declineRequest);
app.put("/request/progress/:id", progressRequest);
app.put("/request/hold/:id", holdRequest);
app.put("/request/assign/:id", assignRequest);
app.delete("/request/remove", removeRequest);

// 404 not found handler
app.use((_req, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

// 500 internal server error handler
app.use((err: any, _req: any, res: Response, _next: any) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5001;
const SERVICE_NAME = process.env.SERVICE_NAME || "Donation Request Service";
app.listen(PORT, () => {
  console.log(`${SERVICE_NAME}  is running on port ${PORT}`);
});
