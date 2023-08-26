import { PrismaClient, blood_type } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { internalServerError } from "../helpers/errorResponses";
const { JWT_SECRET } = process.env;
const prisma = new PrismaClient();

export const signIn = async (req: Request, res: Response) => {
  try {
    const { username, password }: { username: string; password: string } =
      req.body;
    const errorMessage = {
      username: "Username is incorrect!",
      password: "Password is incorrect!",
    };
    const findUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
      select: {
        email: true,
        username: true,
        password: true,
        id: true,
        role: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    if (!findUser) return res.status(400).json(errorMessage);

    const isPasswordOk = bcrypt.compareSync(password, findUser.password);

    if (!isPasswordOk) return res.status(400).json(errorMessage);

    const token = jwt.sign(
      {
        id: findUser.id,
        email: findUser.email,
        username: findUser.username,
        role: findUser.role.role,
        iat: new Date().getTime(),
        exp: Date.now() + 1000 * 60 * 60,
      },
      JWT_SECRET ? JWT_SECRET : ""
    );

    return res.status(200).json({
      message: "Login was successful",
      data: { token, findUser },
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const signUp = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      blood,
      password,
    }: {
      firstName: any;
      lastName: any;
      username: string;
      email: string;
      blood: blood_type;
      password: string;
      role: string;
    } = req.body;

    const SALT_ROUND = process.env.SALT_ROUND;

    const hash = bcrypt.hashSync(
      password,
      bcrypt.genSaltSync(SALT_ROUND ? parseInt(SALT_ROUND) : 10)
    );
    const role = await prisma.role.findUnique({ where: { role: "user" } });
    if (!role)
      return res.status(500).json({ message: "Internal server error" });
    await prisma.user.create({
      data: {
        email,
        username,
        password: hash,
        roleId: role?.id,
        Profile: {
          create: {
            firstName,
            lastName,
            bloodGroup: blood,
          },
        },
      },
    });

    return res.status(200).json({
      isSuccess: true,
      message: "Registration Successful",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
export const forgotPassword = async (req: Request, res: Response) => {};
export const recoverAccount = async (req: Request, res: Response) => {};
export const updatePassword = async (req: Request, res: Response) => {};
export const me = async (req: Request, res: Response) => {};
