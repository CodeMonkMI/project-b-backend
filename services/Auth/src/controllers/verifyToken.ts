import prisma from "@/prisma";
import { TokenDataSchema, VerifyTokenSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

type TokenDataType = z.infer<typeof TokenDataSchema>;

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedData = VerifyTokenSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ errors: parsedData.error.errors });
    }

    const { accessToken } = parsedData.data;
    const decode: TokenDataType | any = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string
    );

    const user = await prisma.user.findUnique({
      where: {
        id: decode.id,
        deleteAt: null,
        status: "ACTIVE",
      },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        role: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(200).json({ message: "Authorized", user });
  } catch (error) {
    next(error);
  }
};
