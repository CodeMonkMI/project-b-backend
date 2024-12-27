import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { TokenDataSchema } from "./schemas";
const { AUTH_SERVICE_URL } = process.env;
type TokenDecodeType = z.infer<typeof TokenDataSchema>;
const auth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.header["authorization"]) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = req.header["authorization"].split(" ")[1];
    const { data }: { data: { user: TokenDecodeType } } = await axios.post(
      `${AUTH_SERVICE_URL}/verify-token`,
      {
        accessToken: token,
      },
      {
        headers: {
          ip: req.ip,
          "user-agent": req.headers["user-agent"],
        },
      }
    );

    req.headers["x-user-id"] = data.user.id;
    req.headers["x-user-email"] = data.user.email;
    req.headers["x-user-username"] = data.user.username;
    req.headers["x-user-role"] = data.user.role;

    next();
  } catch (error) {
    console.log("auth middleware", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const middlewares = { auth };

export default middlewares;
