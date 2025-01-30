import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export class ActivityController {
  constructor(private readonly prisma: PrismaClient) {}
  async getAll(_req: Request, res: Response) {
    this.catchError("getAllActivity", async () => {
      const data = await this.prisma.activity.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        message: "Request was successful!",
        data: data,
      });
    });
  }

  catchError(label: string, callback: () => any): void {
    try {
      callback();
    } catch (error) {
      console.log(`[${label}]Error in ActivityController`, error);
    }
  }
}
