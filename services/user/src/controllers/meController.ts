import ProfileSelector from "@/lib/selectors/Profile";
import UserSelector from "@/lib/selectors/User";
import prisma from "@/prisma";
import { AuthUserSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";
export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    console.log(user);
    const validate = AuthUserSchema.safeParse(user);
    if (validate.error) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const userData = await prisma.user.findUnique({
      where: { username: validate.data.username },
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
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};
