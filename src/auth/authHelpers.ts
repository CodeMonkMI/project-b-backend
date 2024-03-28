import { blood_type } from "@prisma/client";
import jwt from "jsonwebtoken";
const { JWT_SECRET } = process.env;

export const BLOOD_GROUPS: blood_type[] = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
];

interface TokenUserDataProps {
  id: string;
  email: string;
  username: string;
}

export const generateToken = (user: TokenUserDataProps): string => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      iat: new Date().getTime(),
      exp: Date.now() + 1000 * 60 * 60,
    },
    JWT_SECRET ? JWT_SECRET : ""
  );
  return token;
};
