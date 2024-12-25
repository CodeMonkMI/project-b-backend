import prisma from "@/prisma";
import { SignInSchema, TokenDataSchema } from "@/schemas";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

type TokenRequiredType = z.infer<typeof TokenDataSchema>;

const { JWT_SECRET } = process.env;

const generateToken = (user: TokenRequiredType): string => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      iat: new Date().getTime(),
      exp: Date.now() + 1000 * 60 * 60,
    },
    JWT_SECRET ? JWT_SECRET : ""
  );
  return token;
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedData = SignInSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({ erros: parsedData.error.errors });
    }

    const { password, username } = parsedData.data;

    const findUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: username }],
      },
      select: {
        email: true,
        username: true,
        password: true,
        id: true,
        status: true,
        role: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    if (!findUser)
      return res.status(400).json({ message: "Invalid Credentials" });

    const isPasswordOk = bcrypt.compareSync(password, findUser.password);

    if (!isPasswordOk)
      return res.status(400).json({ message: "Invalid Credentials" });
    console.log(findUser);
    if (findUser.status === "PENDING")
      return res.status(406).json({
        message:
          "You account is not yet is still pending! We will let you know after activating you account!",
      });
    if (findUser.status === "INACTIVE")
      return res.status(406).json({
        message:
          "You account is not yet is still pending! We will let you know after activating you account!",
      });
    if (findUser.status === "SUSPENDED")
      return res.status(406).json({
        message: "You account is  suspended! Contact us for more details!",
      });

    const token = generateToken({
      email: findUser.email,
      id: findUser.id,
      role: findUser.role.role,
      username: findUser.username,
    });

    return res.status(200).json({
      message: "Login was successful",
      data: { accessToken: token },
    });
  } catch (error) {
    next(error);
  }
};
