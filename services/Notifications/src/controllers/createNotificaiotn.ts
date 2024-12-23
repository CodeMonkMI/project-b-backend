import prisma from "@/prisma";
import { NotificationDTOSchema } from "@/schemas";
import { NOTIFICATION_TYPE } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

type Notification = {
  type: NOTIFICATION_TYPE;
  message: string;
  receiver: string;
};

export const createNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedData = NotificationDTOSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ errors: parsedData.error.errors });
    }

    const notifications: (Notification & { receiver: string })[] =
      parsedData.data.receivers.map((rc) => {
        return {
          type: parsedData.data.type,
          message: parsedData.data.message,
          receiver: rc,
        };
      });

    const data = await prisma.notification.createMany({
      data: notifications,
    });

    return res.status(200).json({
      message: "Notification creation successful!",
      data,
    });
  } catch (error) {
    next(error);
  }
};
