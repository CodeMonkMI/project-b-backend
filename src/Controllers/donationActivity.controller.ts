import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class ActivityController {
  constructor(private readonly prisma: PrismaClient) {}
  async getAll(req: Request, res: Response) {
    this.catchError("getAllActivity", async () => {
      const role = (req.user as any)?.role?.role;

      const data = await prisma.donationActivity.findMany({
        where: {
          ...(role !== "admin" &&
            role !== "super_admin" && {
              request: {
                requestedBy: {
                  id: (req.user as any)?.id,
                },
              },
            }),
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
          message: true,
          type: true,
          id: true,
        },
      });

      return res.status(200).json({
        message: "Request was successful!",
        data: data,
      });
    });
  }
  async single(req: Request, res: Response) {
    this.catchError("getAllActivity", async () => {
      const single = await prisma.donationActivity.findUnique({
        where: {
          id: req.params.id,
        },
      });

      return res.status(200).json({
        message: "Request was successful!",
        data: single,
      });
    });
  }
  async remove(req: Request, res: Response) {
    this.catchError("getAllActivity", async () => {
      await prisma.donationActivity.update({
        where: { id: req.params.id },
        data: { deleteAt: new Date() },
      });

      return res.status(204).json({
        message: "History deleted successfully!",
        data: null,
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
