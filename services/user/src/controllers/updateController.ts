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
    const user = await prisma.profile.update({
      where: { userId: req.params.id },
      data: {
        ...parsedData.data,
      },
      select: ProfileSelector.getDefault(),
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
