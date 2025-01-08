import { blood_type, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { internalServerError } from "../helpers/errorResponses";
import generateUsername from "../helpers/generateUsername";
import {
  sendMailToAdminsForNewUser,
  sendMailToNewUser,
  sendMailToVerifiedUser,
} from "./Mail";
import { nextRoleName, prevRoleName, randomPassword } from "./userHelpers";
const { JWT_SECRET } = process.env;
const prisma = new PrismaClient();

interface SearchQuery {
  verified?: string;
}

const SELECT_USER = {
  id: true,
  username: true,
  email: true,
  createdAt: true,
  isVerified: true,

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
      where: {
        AND: [
          {
            OR: [{ deleteAt: { isSet: false } }, { deleteAt: null }],
          },
        ],
      },
      select: { ...SELECT_USER },
    });
    console.log(users.length);
    return res.status(200).json({
      message: "Request was successful",
      data: users,
      len: users.length,
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
      roleId: "user",
      isVerified: true,
    },

    select: { ...SELECT_USER },
  });

  // send mail
  sendMailToNewUser(email, password, `${firstName} ${lastName}`);
  const admins = await prisma.user.findMany({
    where: {
      role: { role: "super_admin" },
    },
    select: {
      email: true,
    },
  });
  const adminsEmail = admins.map((a) => a.email);
  sendMailToAdminsForNewUser(adminsEmail);
  // send mail
  return res.status(200).json({
    isSuccess: true,
    message: "User created Successfully!",
    data: response,
  });
};
export const update = async (req: Request, res: Response) => {};

export const verify = async (req: Request<CreateParams>, res: Response) => {
  const { username } = req.params;

  try {
    const userData = await prisma.user.update({
      data: {
        isVerified: true,
      },
      where: {
        username,
      },
      include: {
        Profile: true,
      },
    });
    sendMailToVerifiedUser(userData.email);
    return res.status(200).json({
      isSuccess: true,
      message: "User verified Successfully!",
      data: userData,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

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
      message: "User founded Successfully!",
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
  findUserId: string;
}
export const promote = async (
  req: Request<{}, {}, PromoteReqBody>,
  res: Response
) => {
  try {
    const { findUserRole, findUserId } = req.body;

    const roleText = nextRoleName(findUserRole.role);
    const findRole = await prisma.role.findFirst({ where: { role: roleText } });

    await prisma.user.update({
      where: {
        id: findUserId,
      },
      data: { roleId: findRole?.id },
    });

    const authUserId: any = (req?.user as any).id;

    await prisma.notification.create({
      data: {
        message: `Your are being promoted! Now you are ${findRole?.name}`,
        createdById: authUserId,
        receiverId: [findUserId],
      },
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
    const { findUserRole, findUserId } = req.body;
    const roleText = prevRoleName(findUserRole.role);
    const findRole = await prisma.role.findFirst({ where: { role: roleText } });

    await prisma.user.update({
      where: {
        id: findUserId,
      },
      data: { roleId: findRole?.id },
    });

    const authUserId: any = (req?.user as any).id;

    await prisma.notification.create({
      data: {
        message: `Your are being demoted! Now you are ${findRole?.name}`,
        createdById: authUserId,
        receiverId: [findUserId],
      },
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

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user: any = req.user; // Assuming user info is stored in req.user
    interface ProfileUpdateData {
      firstName?: string;
      lastName?: string;
      displayName?: string;
      fatherName?: string;
      motherName?: string;
      address?: string;
      streetAddress?: string;
      upzila?: string;
      zila?: string;
      phoneNo?: string;
      bloodGroup?: blood_type;
      image?: string;
    }

    const profileUpdateData: ProfileUpdateData = req.body;

    const {
      firstName,
      lastName,
      displayName,
      fatherName,
      motherName,
      address,
      streetAddress,
      upzila,
      zila,
      phoneNo,
      bloodGroup,
      image,
    } = profileUpdateData;

    // Find the user in the database
    const findUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        Profile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!findUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Prepare the update data object
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (displayName) updateData.displayName = displayName;
    if (fatherName) updateData.fatherName = fatherName;
    if (motherName) updateData.motherName = motherName;
    if (address) updateData.address = address;
    if (streetAddress) updateData.streetAddress = streetAddress;
    if (upzila) updateData.upzila = upzila;
    if (zila) updateData.zila = zila;
    if (phoneNo) updateData.phoneNo = phoneNo;
    if (bloodGroup) updateData.bloodGroup = bloodGroup;
    if (image) updateData.image = image;

    // Update the user's profile in the database
    if (!findUser?.Profile) {
      return res.status(404).json({ message: "Profile not found!" });
    }

    // Update the user's profile directly
    await prisma.user.update({
      where: { id: user.id },
      data: {
        Profile: {
          update: updateData,
        },
      },
    });

    return res.status(200).json({
      message: "Profile updated successfully!",
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
