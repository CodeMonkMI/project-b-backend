import prisma from "@/prisma";
import SELECT_REQUEST from "@/utils/selectUser";
import { DONATION_STATUS } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const QUERY_STRING = z.object({
  status: z.nativeEnum(DONATION_STATUS).optional(),
  limit: z.number().optional(),
});

type Query = z.infer<typeof QUERY_STRING>;

export const allRequest = async (
  req: Request<{}, {}, {}, Query>,
  res: Response,
  next: NextFunction
) => {
  // const reqUser = (req as any).user as any;
  // const role = reqUser?.role?.role;

  try {
    const data = await prisma.donationRequested.findMany({
      where: {
        deleteAt: null,
        // OR: [{ deleteAt: { not: null } }, { deleteAt: undefined }],
        // ...(role !== "admin" &&
        //   role !== "super_admin" && {
        //     requestedById: reqUser?.id,
        //   }),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        ...SELECT_REQUEST,
      },
    });

    // todo requested  profile for each request
    // todo donor  for each request

    return res.status(200).json({
      message: "Request was successful!",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

export const singleRequest = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const single = await prisma.donationRequested.findUnique({
      where: {
        id,
      },
      select: {
        ...SELECT_REQUEST,
      },
    });

    if (!single) {
      return res.status(404).json({
        message: "Request not found!",
        data: null,
      });
    }

    return res.status(200).json({
      message: "Request was successful!",
      data: single,
    });
  } catch (error) {
    next(error);
  }
};
