import { PrismaClient, blood_type } from "@prisma/client";
import { Request, Response } from "express";
import { internalServerError } from "../helpers/errorResponses";
import { Password } from "../lib/helpers/Password";
import { StringHelper } from "../lib/helpers/StringHelper";
import { Token } from "../lib/helpers/Token";
import { AuthService } from "../services/auth.service";

const FORGOT_PASS_SECRET = process.env.FORGOT_PASS_SECRET;

type UpdatePasswordRequestBody = {
  password: string;
  newPassword: string;
  confirmPassword: string;
};

type RequestBodyTypes = {
  username: string;
  password: string;
};

export class AuthController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly stringHelper: StringHelper,
    private readonly authService: AuthService
  ) {}

  async signIn(req: Request, res: Response) {
    const { username, password }: RequestBodyTypes = req.body;
    const errorMessage = {
      username: "Username is incorrect!",
      password: "Password is incorrect!",
    };

    const findUser = await this.authService.findFirst({
      OR: [{ username }, { email: username }],
    });
    if (!findUser) return res.status(400).json(errorMessage);

    const isPasswordOk = Password.isMatched(password, findUser.password);

    if (!isPasswordOk) return res.status(400).json(errorMessage);

    if (!findUser.isVerified) {
      return res.status(406).json({
        message:
          "You account is not yet activated! We will let you know when it activated!",
      });
    }

    const token = Token.generateToken({
      email: findUser.email,
      id: findUser.id,
      username: findUser.username,
    });

    return res.status(200).json({
      message: "Login was successful",
      data: { token },
    });
  }

  async signUp(req: Request, res: Response) {
    this.catchError("signin", res, async () => {
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

      const hash = Password.hash(password);
      const role = await this.authService.findUniqueRole({ role: "user" });
      if (!role)
        return res.status(500).json({ message: "Internal server error" });

      const username = await this.stringHelper.generateUniqueUser(
        firstName,
        lastName
      );

      await this.authService.create({
        email,
        username,
        password: hash,
        role: {
          connect: {
            id: role.id!,
          },
        },
        Profile: {
          create: {
            firstName,
            lastName,
            bloodGroup: blood,
          },
        },
      });
      await this.prisma.user.create({
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
    });
  }
  async forgotPassword(req: Request, res: Response) {
    this.catchError("signIN", res, async () => {});
  }
  async recoverAccount(req: Request, res: Response) {
    this.catchError("signIN", res, async () => {
      const user: any = req.user;

      // Generate OTP
      const otp = Password.generateOtp();

      // Send OTP via mail (pseudo-code)
      // await sendOtpEmail(user.email, otp);

      // Update OTP in the database
      await this.prisma.otpRecords.create({
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
    });
  }

  async updatePassword(
    req: Request<{}, {}, UpdatePasswordRequestBody>,
    res: Response
  ) {
    this.catchError("signIN", res, async () => {
      const { password, newPassword } = req.body;
      const user: any = req.user; // Assuming user info is stored in req.user

      // Find the user in the database
      const findUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      });

      if (!findUser) {
        return res.status(404).json({ password: "Password is incorrect!" });
      }

      // Check if the current password is correct
      const isPasswordOk = Password.isMatched(password, findUser.password);
      if (!isPasswordOk) {
        return res.status(400).json({ password: "Password is incorrect!" });
      }

      const hashedNewPassword = Password.hash(newPassword);

      // Update the user's password in the database
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword },
      });

      return res.status(200).json({
        message: "Password updated successfully!",
      });
    });
  }
  async me(req: Request, res: Response) {
    this.catchError("signIN", res, async () => {
      const user: any = req.user;

      const userData = await this.prisma.user.findUnique({
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
    });
  }

  async updateInfo(req: Request, res: Response) {
    this.catchError("signIN", res, async () => {
      const user: any = req.user; // Assuming user info is stored in req.user

      // Extract only the email from the request body
      const { email }: { email?: string } = req.body;

      // Prepare the update data object
      const updateData: any = {};
      if (email) updateData.email = email;

      // Update the user's profile directly
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email: updateData.email,
        },
      });

      return res.status(200).json({
        message: "Profile updated successfully!",
      });
    });
  }
  async updateProfile(req: Request, res: Response) {
    this.catchError("signIN", res, async () => {
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

      const updatedProfile = await this.prisma.profile.update({
        where: { userId: user.id },
        data: updateData,
      });

      return res.status(200).json({
        message: "Profile updated successfully!",
        data: updatedProfile,
      });
    });
  }

  async verifyOtp(req: Request, res: Response) {
    this.catchError("signIN", res, async () => {
      const { otpRecordId }: any = req;
      // Generate a random string with 20 characters
      const verificationId = StringHelper.generateOtpVerificationId();
      const hash = Password.hash(verificationId + FORGOT_PASS_SECRET);
      await this.prisma.otpRecords.update({
        where: { id: otpRecordId },
        data: {
          verificationId: hash,
        },
      });

      return res.status(200).json({
        message: "OTP verified successfully!",
        data: hash,
      });
    });
  }

  async verifyVerificationId(req: Request, res: Response) {
    this.catchError("signIN", res, async () => {
      const { data: verificationId }: any = req.query;

      const data = await this.prisma.otpRecords.findFirst({
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
    });
  }

  async setNewPassword(req: Request, res: Response) {
    this.catchError("signIN", res, async () => {
      const { newPassword, verificationId } = req.body;

      if (!verificationId) {
        return res.status(406).json({
          message: "Verification ID is required",
          data: null,
        });
      }
      const otpRecord = await this.prisma.otpRecords.findFirst({
        where: { verificationId },
      });

      if (!otpRecord) {
        return res.status(406).json({ message: "Password update failed" });
      }

      const hashedNewPassword = Password.hash(newPassword);

      await this.prisma.user.update({
        where: { id: otpRecord.userId },
        data: { password: hashedNewPassword, forgotVerificationId: null },
      });

      await this.prisma.otpRecords.delete({
        where: {
          id: otpRecord.id,
        },
      });

      return res.status(200).json({
        message: "Password updated successfully!",
        data: null,
      });
    });
  }
  catchError(label: string, res: Response, callback: () => any): void {
    try {
      callback();
    } catch (error) {
      console.log(`[${label}]Error in ActivityController`, error);
      internalServerError(res, error);
    }
  }
}
