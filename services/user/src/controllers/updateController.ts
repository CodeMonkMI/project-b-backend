import ProfileSelector from "@/lib/selectors/Profile";
import prisma from "@/prisma";
import { UpdateProfileDTOSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";

export const updateUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedData = UpdateProfileDTOSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ errors: parsedData.error.errors });
    }

    // find if any user exist or not
    const findUser = await prisma.profile.findFirst({
      where: { userId: req.params.id },
    });

    if (!findUser) {
      return res.status(404).json({
        message: "Users data not found!",
      });
    }

    const user = await prisma.profile.update({
      where: { userId: req.params.id },
      data: {
        ...parsedData.data,
      },
      select: ProfileSelector.getDefault(),
    });

    const usr = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        profile: {},
      },
    });

    return res.status(200).json({
      isSuccess: true,
      message: "User",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
