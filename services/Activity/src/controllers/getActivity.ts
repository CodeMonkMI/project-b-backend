import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

export const getActivity = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await prisma.activity.findMany({
      where: {
        deleteAt: null,
      },
      select: {
        createdAt: true,
        id: true,
        message: true,
        type: true,
      },
      orderBy: {
        createdAt: "desc",
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
