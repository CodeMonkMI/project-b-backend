import { LoginAttempt } from "@prisma/client";
import { z } from "zod";

export const SignInSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(32),
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  bloodGroup: z.string(),
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
