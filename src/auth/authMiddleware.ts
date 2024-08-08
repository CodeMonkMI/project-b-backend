import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";

import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { internalServerError } from "../helpers/errorResponses";

const prisma = new PrismaClient();
const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const authMiddleware = (passport: any) => {
  passport.use(
    new Strategy(opts, async (payload, done) => {
      try {
        const user: any = await prisma.user.findUnique({
          where: {
            id: payload.id,
          },
          select: {
            id: true,
            username: true,
            email: true,
            isVerified: true,
            isDelete: false,
            roleId: true,
            role: {
              select: {
                name: true,
                role: true,
              },
            },
            Profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });
        if (!user) return done(null, false);
        return done(null, user);
      } catch (error) {
        console.log(error, "1rs");
        return done(error);
      }
    })
  );
};

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("jwt", (err: any, user: any, info: any) => {
    if (err) {
      console.log(err); // todo remove later
      console.log(info); // todo remove later
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        message: "Authentication failed!",
      });
    }
    req.user = user;
    return next();
  })(req, res, next);
};
export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = (req as any).user?.role.role;
    if (role === "admin" || role === "super_admin") {
      return next();
    }
    return res.status(401).json({
      message: "You are not authorize to perform this action!",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
export const isSuperAdmin = async (
  req: Request<any>,
  res: Response,
  next: NextFunction
) => {
  try {
    if ((req as any).user?.role.role === "super_admin") return next();
    return res.status(401).json({
      message: "You are not authorize to perform this action!",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export default authMiddleware;

export const isAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("jwt", (err: any, user: any, info: any) => {
    if (user) {
      req.user = user;
    }

    return next();
  })(req, res, next);
};
