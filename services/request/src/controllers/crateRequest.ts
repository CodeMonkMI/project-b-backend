import { DONATION_HISTORY } from "@/cofig";
import prisma from "@/prisma";
import { CreateDonationRequestDTOSchema } from "@/schemas";
import SELECT_REQUEST from "@/utils/selectUser";
import { DONATION_STATUS } from "@prisma/client";
import axios from "axios";

import { NextFunction, Request, Response } from "express";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parsedData = CreateDonationRequestDTOSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({ errors: parsedData.error.errors });
  }

  const user: any = (req as any).user as any;
  try {
    const item = await prisma.donationRequested.create({
      data: {
        ...parsedData.data,
        status: user ? DONATION_STATUS.PROGRESS : DONATION_STATUS.REQUEST,
        requestedById: user?.id || parsedData.data.emailUserId || null,
      },
      select: {
        ...SELECT_REQUEST,
      },
    });

    //   create request history
    await axios.post(`${DONATION_HISTORY}/create`, {
      type: "REQUEST",
      message: "An user asked for a blood request!",
      requestId: item.id,
    });
    if (user) {
      // create progress history
      await axios.post(`${DONATION_HISTORY}/create`, {
        type: "PROGRESS",
        message: "A request is in progress",
        requestId: item.id,
      });
    }

    // todo create notification
    // todo send notification to all user

    return res.status(201).json({
      message:
        "You request accepted! We will let you know via email or call you directly!",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export default create;
