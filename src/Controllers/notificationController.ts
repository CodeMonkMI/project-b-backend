import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { internalServerError } from "../helpers/errorResponses";

declare global {
  namespace Express {
    interface Request {
      User?: {
        id: string;
        username?: string;
        roleId: string;
      };
    }
  }
}

export class NotificationController {
  constructor(private readonly prisma: PrismaClient) {}

  async all(req: Request, res: Response) {
    try {
      const data = await this.prisma.notification.findMany({
        where: {
          OR: [{ deleteAt: { isSet: false } }, { deleteAt: null }],
          receiverId: { has: (req.user as any).id },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          message: true,
          createdAt: true,
        },
        take: 9,
      });

      return res.status(200).json({
        message: "Request was successful!",
        data: data,
      });
    } catch (error) {
      internalServerError(res, error);
    }
  }

  async read(req: Request, res: Response) {
    try {
      const data = await this.prisma.notification.update({
        where: {
          id: req.body.id,
        },
        data: {
          readerId: {
            push: req?.User?.id,
          },
        },
      });

      return res.status(200).json({
        message: "Request was successful!",
        data: data,
      });
    } catch (error) {
      internalServerError(res, error);
    }
  }

  async remove(req: Request<{ id: string }>, res: Response) {
    try {
      const data = await this.prisma.notification.update({
        where: { id: req.params.id },
        data: { deleteAt: new Date() },
      });

      return res.status(200).json({
        message: "Notification deleted successful!",
        data: data,
      });
    } catch (error) {
      internalServerError(res, error);
    }
  }
}
