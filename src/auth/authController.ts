import { PrismaClient, blood_type } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { internalServerError } from "../helpers/errorResponses";
import generateUsername from "../helpers/generateUsername";
import { generateToken } from "./authHelpers";

const prisma = new PrismaClient();
const SALT_ROUND = process.env.SALT_ROUND;
const FORGOT_PASS_SECRET = process.env.FORGOT_PASS_SECRET;
export const signIn = async (req: Request, res: Response) => {
  try {
    interface RequestBodyTypes {
      username: string;
      password: string;
    }

    const { username, password }: RequestBodyTypes = req.body;
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
        isVerified: true,
      },
    });

    if (!findUser) return res.status(400).json(errorMessage);

    const isPasswordOk = bcrypt.compareSync(password, findUser.password);

    if (!isPasswordOk) return res.status(400).json(errorMessage);
    if (!findUser.isVerified)
      return res.status(406).json({
        message:
          "You account is not yet activated! We will let you know when it activated!",
      });

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
export const recoverAccount = async (req: Request, res: Response) => {
  const user: any = req.user;

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

  // Send OTP via mail (pseudo-code)
  // await sendOtpEmail(user.email, otp);

  // Update OTP in the database
  await prisma.otpRecords.create({
    data: {
      otp,
      email: user.email,
      userId: user.id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP valid for 15 minutes
    },
  });

  return res
    .status(200)
    .json({ message: "We have send you an OTP to your email" });
};

interface UpdatePasswordRequestBody {
  password: string;
  newPassword: string;
  confirmPassword: string;
}

export const updatePassword = async (
  req: Request<{}, {}, UpdatePasswordRequestBody>,
  res: Response
) => {
  try {
    const { password, newPassword } = req.body;
    const user: any = req.user; // Assuming user info is stored in req.user

    // Find the user in the database
    const findUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!findUser) {
      return res.status(404).json({ password: "Password is incorrect!" });
    }

    // Check if the current password is correct
    const isPasswordOk = bcrypt.compareSync(password, findUser.password);
    if (!isPasswordOk) {
      return res.status(400).json({ password: "Password is incorrect!" });
    }

    // Hash the new password
    const SALT_ROUND = process.env.SALT_ROUND;
    const hashedNewPassword = bcrypt.hashSync(
      newPassword,
      bcrypt.genSaltSync(SALT_ROUND ? parseInt(SALT_ROUND) : 10)
    );

    // Update the user's password in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return res.status(200).json({
      message: "Password updated successfully!",
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
export const me = async (req: Request, res: Response) => {
  const user: any = req.user;

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
    if (!userData)
      return res.status(404).json({
        message: "Data not found!",
        data: {},
      });
    return res.status(200).json({
      message: "User found!",
      data: userData,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const updateInfo = async (req: Request, res: Response) => {
  try {
    const user: any = req.user; // Assuming user info is stored in req.user

    // Extract only the email from the request body
    const { email }: { email?: string } = req.body;

    // Prepare the update data object
    const updateData: any = {};
    if (email) updateData.email = email;

    // Update the user's profile directly
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: updateData.email,
      },
    });

    return res.status(200).json({
      message: "Profile updated successfully!",
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user: any = req.user;
    const {
      firstName,
      lastName,
      displayName,
      fatherName,
      motherName,
      streetAddress,
      phoneNo,
      address,
      upzila,
      zila,
    } = req.body;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (displayName) updateData.displayName = displayName;
    if (fatherName) updateData.fatherName = fatherName;
    if (motherName) updateData.motherName = motherName;
    if (streetAddress) updateData.streetAddress = streetAddress;
    if (phoneNo) updateData.phoneNo = phoneNo;
    if (address) updateData.address = address;
    if (upzila) updateData.upzila = upzila;
    if (zila) updateData.zila = zila;

    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: updateData,
    });

    return res.status(200).json({
      message: "Profile updated successfully!",
      data: updatedProfile,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otpRecordId }: any = req;
    // Generate a random string with 20 characters
    const verificationId = Math.random().toString(36).substring(2, 22);
    const hash = bcrypt.hashSync(
      verificationId + FORGOT_PASS_SECRET,
      bcrypt.genSaltSync(SALT_ROUND ? parseInt(SALT_ROUND) : 10)
    );
    await prisma.otpRecords.update({
      where: { id: otpRecordId },
      data: {
        verificationId: hash,
      },
    });

    return res.status(200).json({
      message: "OTP verified successfully!",
      data: hash,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const verifyVerificationId = async (req: Request, res: Response) => {
  try {
    const { data: verificationId }: any = req.query;

    const data = await prisma.otpRecords.findFirst({
      where: {
        verificationId: verificationId,
      },
    });

    if (!data) {
      return res.status(400).json({
        message: "Verification failed",
        data: null,
      });
    }

    return res.status(200).json({
      message: "Verification successfully!",
      data: verificationId,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const setNewPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword, verificationId } = req.body;

    if (!verificationId) {
      return res.status(406).json({
        message: "Verification ID is required",
        data: null,
      });
    }
    const otpRecord = await prisma.otpRecords.findFirst({
      where: { verificationId },
    });

    if (!otpRecord) {
      return res.status(406).json({ message: "Password update failed" });
    }

    const hashedNewPassword = bcrypt.hashSync(
      newPassword,
      bcrypt.genSaltSync(SALT_ROUND ? parseInt(SALT_ROUND) : 10)
    );

    await prisma.user.update({
      where: { id: otpRecord.userId },
      data: { password: hashedNewPassword, forgotVerificationId: null },
    });

    await prisma.otpRecords.delete({
      where: {
        id: otpRecord.id,
      },
    });

    return res.status(200).json({
      message: "Password updated successfully!",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
