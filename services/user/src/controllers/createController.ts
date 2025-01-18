import { SALT_ROUND } from "@/config";
import generatePassword from "@/lib/core/generatePassword";
import generateUsername from "@/lib/core/generateUsername";
import prisma from "@/prisma";
import { CreateUserDTOSchema } from "@/schemas";
import bcrypt from "bcryptjs";
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

    const role = await prisma.role.findUnique({ where: { role: "user" } });
    if (!role) {
      console.log("there no role exist");
      return res.status(500).json({ message: "Internal server error" });
    }

    let username = generateUsername(firstName + " " + lastName);
    while (true) {
      const data = await prisma.user.findFirst({
        where: { username },
      });
      if (!data) {
        break;
      }
      username = generateUsername(firstName + " " + lastName);
    }

    const password = generatePassword();
    const salt = await bcrypt.genSalt(SALT_ROUND ? parseInt(SALT_ROUND) : 10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        roleId: role?.id,
        password: hash,
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
