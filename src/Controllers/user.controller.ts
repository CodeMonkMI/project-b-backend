import { blood_type, PrismaClient, Role } from "@prisma/client";
import { Request, Response } from "express";
import { internalServerError } from "../helpers/errorResponses";
import { Password } from "../lib/helpers/Password";
import { StringHelper } from "../lib/helpers/StringHelper";
import {
  sendMailToAdminsForNewUser,
  sendMailToNewUser,
  sendMailToVerifiedUser,
} from "../user/Mail";
import { nextRoleName, prevRoleName } from "../user/userHelpers";

interface SearchQuery {
  verified?: string;
}
interface CreateParams {
  username: string;
}
interface RemoveParams {
  username: string;
}
interface PromoteReqBody {
  username: string;
  findUserRole: Role;
  findUserId: string;
}
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
interface CreateRequestBody {
  phoneNo: string;
  role: string;
  blood: blood_type;
  firstName: string;
  lastName: string;
  email: string;
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

export class UserController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly stringHelper: StringHelper
  ) {}

  async all(req: Request<{}, {}, {}, SearchQuery>, res: Response) {
    try {
      const { query } = req;

      const users = await this.prisma.user.findMany({
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
  }

  async getRoles(req: Request, res: Response) {
    try {
      const roles = await this.prisma.role.findMany({
        select: { id: true, name: true, role: true },
      });

      return res.status(200).json({
        message: "Request was successful",
        data: roles,
      });
    } catch (error) {
      internalServerError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    type bloodType =
      | "A_POSITIVE"
      | "A_NEGATIVE"
      | "B_POSITIVE"
      | "B_NEGATIVE"
      | "AB_POSITIVE"
      | "AB_NEGATIVE"
      | "O_POSITIVE"
      | "O_NEGATIVE";

    const {
      phoneNo,
      role,
      blood,
      firstName,
      lastName,
      email,
    }: CreateRequestBody = req.body;

    const username = await this.stringHelper.generateUniqueUser(
      firstName,
      lastName
    );

    const password = Password.random(12);
    const hash = Password.hash(password);

    const response = await this.prisma.user.create({
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
    const admins = await this.prisma.user.findMany({
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
  }

  async update(req: Request, res: Response) {}

  async verify(req: Request<CreateParams>, res: Response) {
    const { username } = req.params;

    try {
      const userData = await this.prisma.user.update({
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
  }

  async single(req: Request<CreateParams>, res: Response) {
    const { username } = req.params;
    try {
      const userData = await this.prisma.user.findFirst({
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
  }

  async remove(req: Request<RemoveParams>, res: Response) {
    try {
      const { username } = req.params;
      await this.prisma.user.updateMany({
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
  }

  async removeConfirm(req: Request, res: Response) {
    try {
      const { username } = req.params;
      await this.prisma.user.updateMany({
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
  }

  async promote(req: Request<{}, {}, PromoteReqBody>, res: Response) {
    try {
      const { findUserRole, findUserId } = req.body;

      const roleText = nextRoleName(findUserRole.role);
      const findRole = await this.prisma.role.findFirst({
        where: { role: roleText },
      });

      await this.prisma.user.update({
        where: {
          id: findUserId,
        },
        data: { roleId: findRole?.id },
      });

      const authUserId: any = (req?.user as any).id;

      await this.prisma.notification.create({
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
  }

  async demote(req: Request, res: Response) {
    try {
      const { findUserRole, findUserId } = req.body;
      const roleText = prevRoleName(findUserRole.role);
      const findRole = await this.prisma.role.findFirst({
        where: { role: roleText },
      });

      await this.prisma.user.update({
        where: {
          id: findUserId,
        },
        data: { roleId: findRole?.id },
      });

      const authUserId: any = (req?.user as any).id;

      await this.prisma.notification.create({
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
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const user: any = req.user; // Assuming user info is stored in req.user

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
      const findUser = await this.prisma.user.findUnique({
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
      await this.prisma.user.update({
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
  }
}
