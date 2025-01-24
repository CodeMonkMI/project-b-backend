import prisma from "@/prisma";
import { SignUpSchema, TokenDataSchema } from "@/schemas";
import sendToQueue from "@/sender";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
const SALT_ROUND = process.env.SALT_ROUND;
type TokenRequiredType = z.infer<typeof TokenDataSchema>;

function generateUsername(name: string) {
  // Generate a random number between 1000 and 9999
  const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

  // Concatenate the name and random number
  const username = `${name}${randomNumber}`;

  return username.replace(" ", "_");
}

export default generateUsername;

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedData = SignUpSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ errors: parsedData.error.errors });
    }

    const { password, firstName, lastName, email } = parsedData.data;

    // find if any user exist or not
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (user) {
      return res.status(400).json({
        errors: [
          {
            code: "invalid_data",
            expected: "unique",
            received: "existed email",
            path: ["email"],
            message: "Required Unique",
          },
        ],
      });
    }

    const salt = await bcrypt.genSalt(SALT_ROUND ? parseInt(SALT_ROUND) : 10);
    const hash = await bcrypt.hash(password, salt);

    const role = await prisma.role.findUnique({ where: { role: "user" } });
    if (!role) {
      console.log("there no role exist");
      return res.status(500).json({ message: "Internal server error" });
    }

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
        roleId: role?.id,
        password: hash,
      },
    });

    // create user profile via user service
    const {} = parsedData;
    sendToQueue(
      "auth-user-signup",
      JSON.stringify({
        email,
        firstName,
        lastName,
        role: role.role,
        bloodGroup: parsedData.data.bloodGroup,
      })
    );
    // todo send mail to registered user

    // create a notification for admins
    const admins = await prisma.user.findMany({
      where: {
        role: {
          OR: [{ role: "admin" }, { role: "super_admin" }],
        },
      },
      select: {
        id: true,
      },
    });

    sendToQueue(
      "auth-signup",
      JSON.stringify({
        type: "ACCOUNT",
        receiver: admins.map((i) => i.id),
        message: "New account is created. Need to verify it",
      })
    );

    return res.status(200).json({
      isSuccess: true,
      message: "Registration Successful",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
