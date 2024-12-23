import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

export const removeNotification = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    await prisma.notification.updateMany({
      where: {
        receiver: req.params.userId,
      },
      data: {
        deleteAt: new Date(),
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
