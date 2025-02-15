const { JWT_SECRET } = process.env;
import jwt from "jsonwebtoken";
interface TokenRequiredData {
  id: string;
  email: string;
  username: string;
}
export class Token {
  static generateToken(user: TokenRequiredData): string {
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
  }
}
