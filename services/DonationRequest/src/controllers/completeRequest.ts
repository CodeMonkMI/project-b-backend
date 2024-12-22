import prisma from "@/prisma";
import { DONATION_STATUS } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export const complete = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const donationRequest = await prisma.donationRequested.findFirst({
      where: {
        id: req.params.id,
        status: DONATION_STATUS.READY,
      },
    });
    console.log("donationRequest", donationRequest);
    if (!donationRequest) {
      return res.status(404).json({
        message: "Request Not found!",
      });
    }

    await prisma.donationRequested.update({
      where: {
        id: req.params.id,
        status: DONATION_STATUS.READY,
      },
      data: {
        status: DONATION_STATUS.COMPLETED,
      },
    });

    // todo update user profile last donation date

    // todo crate a complete history

    // todo create notification for donor and request user

    return res.status(200).json({
      message: "Donation request completed!",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export default complete;
