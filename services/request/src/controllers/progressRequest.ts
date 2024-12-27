import { DONATION_HISTORY } from "@/cofig";
import prisma from "@/prisma";
import { DONATION_STATUS } from "@prisma/client";
import axios from "axios";
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

    // create a progress  history
    await axios.post(`${DONATION_HISTORY}/history/create`, {
      type: "PROGRESS",
      message: "An user asked for a blood request!",
      requestId: id,
    });

    // todo create notification for request user

    return res.status(202).json({
      message: "Donation status updated!",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export default progress;
