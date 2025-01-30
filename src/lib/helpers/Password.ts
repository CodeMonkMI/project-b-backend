import bcrypt from "bcryptjs";
const SALT_ROUND = process.env.SALT_ROUND;

export class Password {
  static hash(password: string): string {
    return bcrypt.hashSync(
      password,
      bcrypt.genSaltSync(SALT_ROUND ? parseInt(SALT_ROUND) : 10)
    );
  }
  static isMatched(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
  static generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  static random(length: number): string {
    const chars =
      "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let password = "";
    for (let i = 0; i <= length; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }
    return password;
  }
}
