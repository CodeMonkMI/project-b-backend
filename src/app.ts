import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";

const prisma = new PrismaClient();
const app = express();

app.get("/", async (req: Request, res: Response) => {
  res.status(200).json("ok it working");
});

app.listen(9000, () => {
  console.log("Server is running on port 9000");
});
