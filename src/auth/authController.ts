import { PrismaClient, blood_type } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { internalServerError } from "../helpers/errorResponses";
import generateUsername from "../helpers/generateUsername";
import { generateToken } from "./authHelpers";
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

    const token = generateToken(findUser);

    return res.status(200).json({
      message: "Login was successful",
      data: { token },
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

      email,
      blood,
      password,
    }: {
      firstName: any;
      lastName: any;
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

    let username = generateUsername(firstName + " " + lastName);
    while (true) {
      const data = await prisma.user.findFirst({
        where: { username },
      });
      if (!data) {
        break;
      }
      username = generateUsername(firstName);
    }

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

    const findUser = await prisma.user.findUnique({
      where: { username },
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
    let token = "";
    if (findUser) {
      token = generateToken(findUser);
    }

    return res.status(200).json({
      isSuccess: true,
      message: "Registration Successful",
      data: { token },
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
export const forgotPassword = async (req: Request, res: Response) => {};
export const recoverAccount = async (req: Request, res: Response) => {};
export const updatePassword = async (req: Request, res: Response) => {};
export const me = async (req: Request, res: Response) => {
  const user: any = req.user;
  console.log(user.id);
  try {
    const userData = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        Profile: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
            fatherName: true,
            motherName: true,
            address: true,
            streetAddress: true,
            upzila: true,
            zila: true,
            phoneNo: true,
            lastDonation: true,
            bloodGroup: true,
            image: true,
          },
        },
        role: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });
    return res.status(200).json(userData);
  } catch (error) {
    internalServerError(res, error);
  }
};
