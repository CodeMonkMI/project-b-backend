import prisma from "@/prisma";
import { ActivityDTOSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";

export const createActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedData = ActivityDTOSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ errors: parsedData.error.errors });
    }

    const data = await prisma.activity.create({
      data: {
        ...parsedData.data,
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
