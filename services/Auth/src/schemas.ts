import { z } from "zod";

export const SignInSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const signUpSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6).max(32),
});

export const TokenDataSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  role: z.string(),
});
