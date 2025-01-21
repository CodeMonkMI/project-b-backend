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
// all routes
app.get("/all", allRequest);
app.post("/create", crateRequest);
app.get("/details/:id", singleRequest);
app.put("/approve/:id", approveRequest);
app.put("/complete/:id", completeRequest);
app.put("/decline/:id", declineRequest);
app.put("/progress/:id", progressRequest);
app.put("/hold/:id", holdRequest);
app.put("/assign/:id", assignRequest);
app.delete("/remove/:id", removeRequest);

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
