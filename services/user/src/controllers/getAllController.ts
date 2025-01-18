import UserSelector from "@/lib/selectors/User";
import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

export const getAllUser = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await prisma.user.findMany({
      where: {
        deleteAt: null,
      },
      select: UserSelector.getAll(),
    });

    return res.status(200).json({
      message: "User fetched success",
      data,
    });
  } catch (error) {
    next(error);
  }
};
