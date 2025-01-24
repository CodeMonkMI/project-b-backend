import { AuthUser } from "@/schemas";
import { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user: AuthUser;
    }
  }
}

export const generateAuthUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const user: AuthUser = {
      id: req.headers["x-user-id"] as string,
      username: req.headers["x-user-username"] as string,
      email: req.headers["x-user-email"] as string,
      status: req.headers["x-user-status"] as string,
      role: req.headers["x-user-role"] as string,
    };

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default generateAuthUser;
