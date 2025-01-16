import prisma from "@/prisma";
import sendToQueue from "@/sender";
import SELECT_REQUEST from "@/utils/selectUser";
import { DONATION_STATUS } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export const approve = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const findRequest = await prisma.donationRequested.findFirst({
      where: {
        id: req.params.id,
      },
    });

    if (!findRequest) {
      return res.status(404).json({
        message: "Request not found!",
        data: null,
      });
    }

    const item = await prisma.donationRequested.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: DONATION_STATUS.PROGRESS,
      },
      select: {
        ...SELECT_REQUEST,
      },
    });

    // create approve history
    sendToQueue(
      "request-handle-history",
      JSON.stringify({
        type: "APPROVE",
        message: "New request approved!",
        requestId: item.id,
      })
    );

    // todo send notification who asked for donation

    return res.status(202).json({
      message: "Donation request approved!",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export default approve;
