import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

export const readNotification = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
        data: null,
      });
    }
    if (!notification.isRead) {
      await prisma.notification.update({
        where: {
          id: req.params.id,
        },
        data: {
          isRead: true,
        },
      });
    }

    return res.status(202).json({
      message: "Notification updated successfully!",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
