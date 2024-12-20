import prisma from "@/prisma";
import { DONATION_STATUS } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export const decline = async (
  req: Request<{ id: string }>,
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
    await prisma.donationRequested.update({
      where: {
        id,
      },
      data: {
        status: DONATION_STATUS.DECLINED,
      },
    });

    //   todo create history for decline request

    //  todo create notification for requested user
    return res.status(202).json({
      message: "Donation request approved!",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export default decline;
