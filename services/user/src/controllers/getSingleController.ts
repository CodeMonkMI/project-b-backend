import ProfileSelector from "@/lib/selectors/Profile";
import UserSelector from "@/lib/selectors/User";
import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

export const getSingleUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        ...UserSelector.getSingle(),
        profile: {
          select: ProfileSelector.getDefault(),
        },
      },
    });

    return res.status(200).json({
      isSuccess: true,
      message: "User fetched success",
      data,
    });
  } catch (error) {
    next(error);
  }
};
