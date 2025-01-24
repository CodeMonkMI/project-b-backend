import { LoginAttempt } from "@prisma/client";
import { z } from "zod";

enum BLOOD_GROUP {
  A_POSITIVE = "A_POSITIVE",
  A_NEGATIVE = "A_NEGATIVE",
  B_POSITIVE = "B_POSITIVE",
  B_NEGATIVE = "B_NEGATIVE",
  AB_POSITIVE = "AB_POSITIVE",
  AB_NEGATIVE = "AB_NEGATIVE",
  O_POSITIVE = "O_POSITIVE",
  O_NEGATIVE = "O_NEGATIVE",
}

export const SignInSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(32),
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  bloodGroup: z.nativeEnum(BLOOD_GROUP),
});

export const TokenDataSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  role: z.string(),
});

export const VerifyTokenSchema = z.object({
  accessToken: z.string(),
});

export const LoginHistorySchema = z.object({
  attempt: z.nativeEnum(LoginAttempt),
  ipAddress: z.string(),
  userAgent: z.string(),
  userId: z.string(),
});

export type LoginHistoryType = z.infer<typeof LoginHistorySchema>;
export type TokenRequiredType = z.infer<typeof TokenDataSchema>;

export type ZodSingleError = {
  code: string;
  expected: string;
  message: string;
  path: string[];
  received: string;
};
