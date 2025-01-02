import { TokenRequiredType } from "@/schemas";
import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

export const generateToken = (user: TokenRequiredType): string => {
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
