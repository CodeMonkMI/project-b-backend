import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

export const removeUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    // find if any user exist or not
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isDelete: true,
      },
    });

    return res.status(201).json({
      isSuccess: true,
      message: "User delete request success! An Super will look into it.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
