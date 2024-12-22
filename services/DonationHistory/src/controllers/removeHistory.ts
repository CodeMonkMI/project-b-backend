import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

export const removeHistory = async (
  req: Request<{ requestId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    // todo validate request id if exist
    const requestId = req.params.requestId;

    const data = await prisma.donationHistory.findMany({
      where: {
        requestId,
        deleteAt: { not: null },
      },
      select: {
        createdAt: true,
        message: true,
        type: true,
        id: true,
        requestId: true,
      },
    });
    if (!data) {
      return res.status(404).json({
        message: "History not found",
        data: null,
      });
    }
    await prisma.donationHistory.updateMany({
      where: { requestId },
      data: { deleteAt: new Date() },
    });

    return res.status(204).json({
      message: "History deleted successfully!",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
