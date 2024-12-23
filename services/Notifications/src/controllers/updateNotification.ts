import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

export const readNotification = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    await prisma.notification.update({
      where: {
        id: req.params.id,
      },
      data: {
        isRead: true,
      },
    });

    return res.status(204).json({
      message: "Notification removed successfully!",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
