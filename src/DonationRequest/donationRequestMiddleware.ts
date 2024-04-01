import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { internalServerError } from "../helpers/errorResponses";

const prisma = new PrismaClient();

export const requestFinder = async (
  req: Request<{ id: string }, {}, { request: any }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await prisma.donationRequested.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (data) {
      req.body.request = data;
      return next();
    }
    return res.status(400).json({
      message: "Request not found!",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
