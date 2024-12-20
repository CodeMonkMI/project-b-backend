import prisma from "@/prisma";
import SELECT_REQUEST from "@/utils/selectUser";
import { DONATION_STATUS } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const CompleteReqDTOSchema = z.object({
  donor: z.string(),
});

export const complete = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsedData = CompleteReqDTOSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({ errors: parsedData.error.errors });
    }

    const donationRequest = await prisma.donationRequested.findFirst({
      where: {
        id: req.params.id,
        status: DONATION_STATUS.READY,
        donorId: { not: null },
      },
      select: {
        donorId: true,
      },
    });

    if (!donationRequest) {
      return res.status(400).json({
        message: "Invalid Request!",
      });
    }

    const item = await prisma.donationRequested.update({
      where: {
        id: req.params.id,
        status: DONATION_STATUS.READY,
      },
      data: {
        status: DONATION_STATUS.COMPLETED,
      },
      select: { ...SELECT_REQUEST },
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
