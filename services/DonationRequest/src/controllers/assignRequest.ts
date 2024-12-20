import prisma from "@/prisma";
import { DONATION_STATUS } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const CompleteReqDTOSchema = z.object({
  donor: z.string(),
});

export const assign = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const parsedData = CompleteReqDTOSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({ errors: parsedData.error.errors });
  }
  const id = req.params.id;
  try {
    const findRequest = await prisma.donationRequested.findFirst({
      where: { id },
    });
    if (!findRequest) {
      return res.status(404).json({
        message: "Request not found!",
        data: null,
      });
    }

    await prisma.donationRequested.update({
      where: { id },
      data: { donorId: parsedData.data.donor, status: DONATION_STATUS.READY },
    });

    // todo get donor data for user service
    const donorData = {};

    //  todo create assign history

    // todo create notification for assigned donor
    // todo create notification for requested user

    return res.status(200).json({
      message: "Donor assigned successfully",
      data: donorData,
    });
  } catch (error) {
    next(error);
  }
};

export default assign;
