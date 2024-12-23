import prisma from "@/prisma";
import { NotificationDTOSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";

export const createActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedData = NotificationDTOSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ errors: parsedData.error.errors });
    }

    const data = await prisma.notification.create({
      data: {
        ...parsedData.data,
      },
      select: {
        id: true,
        type: true,
        message: true,
        createdAt: true,
        isRead: true,
      },
    });

    return res.status(200).json({
      message: "Notification creation successful!",
      data,
    });
  } catch (error) {
    next(error);
  }
};
