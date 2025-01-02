import prisma from "@/prisma";
import { LoginHistoryType, SignInSchema } from "@/schemas";
import { generateToken } from "@/utils/token";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";

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
      return res.status(400).json({ error: parsedData.error.errors });
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

    const statusWiseMessage: {
      [key: string]: string;
    } = {
      PENDING:
        "You account is not yet is still pending! We will let you know after activating you account!",
      INACTIVE:
        "You account is not yet is still pending! We will let you know after activating you account!",
      SUSPENDED: "You account is  suspended! Contact us for more details!",
    };

    if (findUser.status !== "ACTIVE") {
      await createLoginHistory({
        ipAddress,
        userAgent,
        userId: findUser.id,
        attempt: "FAILED",
      });
      return res.status(406).json({
        message: statusWiseMessage[findUser.status] || "Invalid Request",
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
