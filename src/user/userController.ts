import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { internalServerError } from "../helpers/errorResponses";
import { randomPassword } from "./userHelpers";
const { JWT_SECRET } = process.env;
const prisma = new PrismaClient();

interface SearchQuery {
  nonVerified?: boolean;
  isNew?: boolean;
  isActive?: boolean;
  isDonatable?: boolean;
  limit?: number;
}

export const all = async (
  req: Request<{}, {}, {}, SearchQuery>,
  res: Response
) => {
  try {
    const { query } = req;

    const users = prisma.user.findMany({
      where: {
        deleteAt: null,
      },
    });

    return res.status(200).json({
      message: "Login was successful",
      data: { users },
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const create = async (req: Request, res: Response) => {
  const {
    username,
    email,
    role,
  }: {
    username: string;
    email: string;
    role: string;
  } = req.body;

  const password = randomPassword(12);
  const SALT_ROUND = process.env.SALT_ROUND;

  const hash = bcrypt.hashSync(
    password,
    bcrypt.genSaltSync(SALT_ROUND ? parseInt(SALT_ROUND) : 10)
  );

  await prisma.user.create({
    data: {
      email,
      username,
      password: hash,
      roleId: role,
      isVerified: true,
    },
  });

  // ? send password to email;

  return res.status(200).json({
    isSuccess: true,
    message: "User created Successfully!",
    data: null,
  });
};
export const update = async (req: Request, res: Response) => {};
export const single = async (req: Request, res: Response) => {};
export const remove = async (req: Request, res: Response) => {};
export const removeConfirm = async (req: Request, res: Response) => {};
export const promote = async (req: Request, res: Response) => {};
export const demote = async (req: Request, res: Response) => {};
