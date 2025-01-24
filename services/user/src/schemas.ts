import { BLOOD_GROUP } from "@prisma/client";
import { z } from "zod";

export const SignInSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const CreateUserDTOSchema = z.object({
  email: z.string({ message: "Email is required!" }),
  firstName: z.string(),
  lastName: z.string(),
  bloodGroup: z.nativeEnum(BLOOD_GROUP),
});

export const UpdateProfileDTOSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    displayName: z.string(),
    bloodGroup: z.nativeEnum(BLOOD_GROUP),
    fatherName: z.string(),
    motherName: z.string(),
    address: z.string(),
    streetAddress: z.string(),
    upzila: z.string(),
    zila: z.string(),
    phoneNo: z.string(),
    lastDonation: z
      .string()
      .datetime({ message: "Last donation must be datetime" }),
    image: z.string(),
    userId: z.string(),
  })
  .partial();

export type ZodSingleError = {
  code: string;
  expected: string;
  message: string;
  path: string[];
  received: string;
};

export const AuthUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  status: z.string(),
  role: z.string(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
