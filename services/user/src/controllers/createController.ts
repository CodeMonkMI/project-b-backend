import generateUniqueUsername from "@/lib/core/generateUniqueUsername";
import prisma from "@/prisma";
import { CreateUserDTOSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedData = CreateUserDTOSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ errors: parsedData.error.errors });
    }

    const { firstName, lastName, email } = parsedData.data;

    // find if any user exist or not
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (user) {
      return res.status(400).json({
        errors: [
          {
            code: "invalid_data",
            expected: "unique",
            received: "existed email",
            path: ["email"],
            message: "Required Unique",
          },
        ],
      });
    }

    // todo check auth user if exist

    const username = await generateUniqueUsername(firstName, lastName);

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        profile: {
          create: {
            firstName,
            lastName,
            bloodGroup: parsedData.data.bloodGroup,
          },
        },
      },
    });

    // todo create user profile via user service
    // todo send mail to registered user
    // todo add auth user with same info

    return res.status(200).json({
      isSuccess: true,
      message: "User",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};
