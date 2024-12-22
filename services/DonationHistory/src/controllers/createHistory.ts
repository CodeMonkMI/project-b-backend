import { REQUEST_SERVICE } from "@/config";
import prisma from "@/prisma";
import { CreateDonationHistoryDTOSchema } from "@/schemas";
import invalidRequestIdError from "@/utils/invalidRequestError";
import axios, { AxiosError } from "axios";
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

    await axios.get(
      `${REQUEST_SERVICE}/request/details/${parsedData.data.requestId}`
    );

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
    if (error instanceof AxiosError) {
      console.log("axios error", error.response);
      if (error.status === 404) {
        return res.status(400).json({
          errors: [invalidRequestIdError],
        });
      }
    }
    next(error);
  }
};
