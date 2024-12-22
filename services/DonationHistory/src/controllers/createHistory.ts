import prisma from "@/prisma";
import { CreateDonationHistoryDTOSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";

export const createHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedData = CreateDonationHistoryDTOSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ errors: parsedData.error.errors });
    }

    // todo validate request id if exist

    const data = await prisma.donationHistory.create({
      data: {
        ...parsedData.data,
      },
    });

    return res.status(200).json({
      message: "Request was successful!",
      data,
    });
  } catch (error) {
    next(error);
  }
};
