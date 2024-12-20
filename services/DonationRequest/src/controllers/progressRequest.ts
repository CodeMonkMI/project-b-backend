import prisma from "@/prisma";
import { DONATION_STATUS } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
export const progress = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const findRequest = await prisma.donationRequested.findFirst({
      where: {
        id,
      },
    });
    if (!findRequest) {
      return res.status(404).json({
        message: "Request not found!",
        data: null,
      });
    }
    if (findRequest?.donorId) {
      // todo disconnect previously connected donor if exist
    }
    await prisma.donationRequested.update({
      where: {
        id,
      },
      data: {
        status: DONATION_STATUS.PROGRESS,
        donorId: null,
      },
    });

    // todo create a progress  history
    // todo create notification for request user

    return res.status(202).json({
      message: "Donation status updated!",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
