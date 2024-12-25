import prisma from "@/prisma";
import { SignInSchema, TokenDataSchema } from "@/schemas";
import { LoginAttempt } from "@prisma/client";
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

type LoginHistoryType = {
  attempt: LoginAttempt;
  ipAddress: string;
  userAgent: string;
  userId: string;
};
const createLoginHistory = async (info: LoginHistoryType) => {
  await prisma.loginHistory.create({
    data: {
      ...info,
    },
  });
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

    // get ip address and user agent
    const ipAddress = req.header["x-forwarded-for"] || req.ip || "";
    const userAgent = req.header["user-agent"] || "";

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

    const isPasswordOk = await bcrypt.compare(password, findUser.password);

    if (!isPasswordOk)
      return res.status(400).json({ message: "Invalid Credentials" });

    if (findUser.status === "PENDING") {
      await createLoginHistory({
        ipAddress,
        userAgent,
        userId: findUser.id,
        attempt: "FAILED",
      });
      return res.status(406).json({
        message:
          "You account is not yet is still pending! We will let you know after activating you account!",
      });
    }
    if (findUser.status === "INACTIVE") {
      await createLoginHistory({
        ipAddress,
        userAgent,
        userId: findUser.id,
        attempt: "FAILED",
      });
      return res.status(406).json({
        message:
          "You account is not yet is still pending! We will let you know after activating you account!",
      });
    }
    if (findUser.status === "SUSPENDED") {
      await createLoginHistory({
        ipAddress,
        userAgent,
        userId: findUser.id,
        attempt: "FAILED",
      });
      return res.status(406).json({
        message: "You account is  suspended! Contact us for more details!",
      });
    }
    await createLoginHistory({
      ipAddress,
      userAgent,
      userId: findUser.id,
      attempt: "SUCCESS",
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
