import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { internalServerError } from "../helpers/errorResponses";
import generateUsername from "../helpers/generateUsername";
import { nextRoleName, prevRoleName, randomPassword } from "./userHelpers";
const { JWT_SECRET } = process.env;
const prisma = new PrismaClient();

interface SearchQuery {
  nonVerified?: boolean;
  isNew?: boolean;
  isActive?: boolean;
  isDonatable?: boolean;
  limit?: number;
}

const SELECT_USER = {
  id: true,
  username: true,
  email: true,
  createdAt: true,
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
};

export const all = async (
  req: Request<{}, {}, {}, SearchQuery>,
  res: Response
) => {
  try {
    const { query } = req;

    const users = await prisma.user.findMany({
      select: { ...SELECT_USER },
    });

    return res.status(200).json({
      message: "Request was successful",
      data: users,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      select: { id: true, name: true, role: true },
    });

    return res.status(200).json({
      message: "Request was successful",
      data: roles,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const create = async (req: Request, res: Response) => {
  type bloodType =
    | "A_POSITIVE"
    | "A_NEGATIVE"
    | "B_POSITIVE"
    | "B_NEGATIVE"
    | "AB_POSITIVE"
    | "AB_NEGATIVE"
    | "O_POSITIVE"
    | "O_NEGATIVE";

  interface CreateRequestBody {
    phoneNo: string;
    role: string;
    blood: bloodType;
    firstName: string;
    lastName: string;
    email: string;
  }

  const {
    phoneNo,
    role,
    blood,
    firstName,
    lastName,
    email,
  }: CreateRequestBody = req.body;

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

  const password = randomPassword(12);
  const SALT_ROUND = process.env.SALT_ROUND;

  const hash = bcrypt.hashSync(
    password,
    bcrypt.genSaltSync(SALT_ROUND ? parseInt(SALT_ROUND) : 10)
  );

  const response = await prisma.user.create({
    data: {
      email,
      username,
      Profile: {
        create: {
          firstName,
          lastName,
          bloodGroup: blood,
          phoneNo,
        },
      },
      password: hash,
      roleId: role,
      isVerified: true,
    },

    select: { ...SELECT_USER },
  });

  // ? send password to email;
  return res.status(200).json({
    isSuccess: true,
    message: "User created Successfully!",
    data: response,
  });
};
export const update = async (req: Request, res: Response) => {};

interface CreateParams {
  username: string;
}

export const single = async (req: Request<CreateParams>, res: Response) => {
  const { username } = req.params;
  try {
    const userData = await prisma.user.findFirst({
      where: {
        OR: [{ email: username }, { username }],
      },
      select: {
        ...SELECT_USER,
      },
    });
    return res.status(200).json({
      isSuccess: true,
      message: "User created Successfully!",
      data: userData,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
interface RemoveParams {
  username: string;
}
export const remove = async (req: Request<RemoveParams>, res: Response) => {
  try {
    const { username } = req.params;
    await prisma.user.updateMany({
      where: {
        OR: [{ username }, { email: username }],
      },
      data: { isDelete: true },
    });

    // send mail to super admin

    return res.status(204).json({
      isSuccess: true,
      message: "User delete request sended!",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
export const removeConfirm = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    await prisma.user.updateMany({
      where: {
        OR: [{ username }, { email: username }],
      },
      data: { deleteAt: new Date(Date.now()) },
    });
    return res.status(204).json({
      isSuccess: true,
      message: "User deleted successfully!",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

interface PromoteReqBody {
  username: string;
  findUserRole: Role;
}
export const promote = async (
  req: Request<{}, {}, PromoteReqBody>,
  res: Response
) => {
  try {
    const { findUserRole, username } = req.body;
    const roleText = nextRoleName(findUserRole.role);
    const findRole = await prisma.role.findFirst({ where: { role: roleText } });

    await prisma.user.updateMany({
      where: {
        OR: [{ username }, { email: username }],
      },
      data: { roleId: findRole?.id },
    });

    // send mail to super admin and the user

    return res.status(200).json({
      isSuccess: true,
      message: "User promoted successfully",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
export const demote = async (req: Request, res: Response) => {
  try {
    const { findUserRole, username } = req.body;
    const roleText = prevRoleName(findUserRole.role);
    const findRole = await prisma.role.findFirst({ where: { role: roleText } });

    await prisma.user.updateMany({
      where: {
        OR: [{ username }, { email: username }],
      },
      data: { roleId: findRole?.id },
    });

    // send mail to super admin and the user

    return res.status(200).json({
      isSuccess: true,
      message: "User demoted successfully",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
