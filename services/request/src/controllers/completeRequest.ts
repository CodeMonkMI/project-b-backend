import prisma from "@/prisma";
import sendToQueue from "@/sender";
import { DONATION_STATUS } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export const complete = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const donationRequest = await prisma.donationRequested.findFirst({
      where: {
        id,
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
        id,
        status: DONATION_STATUS.READY,
      },
      data: {
        status: DONATION_STATUS.COMPLETED,
      },
    });

    // todo update user profile last donation date

    // crate a complete history
    sendToQueue(
      "request-handle-history",
      JSON.stringify({
        type: "COMPLETE",
        message: "A request is been completed!",
        requestId: id,
      })
    );

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
