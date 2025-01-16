import { REQUEST_SERVICE } from "@/config";
import prisma from "@/prisma";
import invalidRequestIdError from "@/utils/invalidRequestError";
import axios, { AxiosError } from "axios";
import { NextFunction, Request, Response } from "express";

export const removeHistory = async (
  req: Request<{ requestId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestId = req.params.requestId;
    const request = await axios.get(
      `${REQUEST_SERVICE}/request/details/${requestId}`
    );
    if (!request) {
      return res.status(404).json({
        message: "History not found",
        data: null,
      });
    }

    const data = await prisma.donationHistory.findMany({
      where: {
        requestId,
        deleteAt: null,
      },
    });
    //  response if there is no history
    if (data.length == 0) {
      return res.status(204).json({
        message: "History deleted successfully!",
        data: null,
      });
    }
    await prisma.donationHistory.updateMany({
      where: { requestId, deleteAt: null },
      data: { deleteAt: new Date() },
    });

    return res.status(204).json({
      message: "History deleted successfully!",
      data: null,
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
