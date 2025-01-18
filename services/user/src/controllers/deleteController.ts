import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    // find if any user exist or not
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        deleteAt: new Date(),
      },
    });

    return res.status(201).json({
      isSuccess: true,
      message: "User deleted Successfully!",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
