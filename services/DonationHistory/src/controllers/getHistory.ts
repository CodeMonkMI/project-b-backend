import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

export const allHistory = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await prisma.donationHistory.findMany({
      where: {
        deleteAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
        message: true,
        type: true,
        id: true,
        requestId: true,
      },
    });

    return res.status(200).json({
      message: "Request was successful!",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

export const requestHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await prisma.donationHistory.findMany({
      where: {
        requestId: req.params.requestId,
        deleteAt: null,
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
    return res.status(200).json({
      message: "Request was successful!",
      data,
    });
  } catch (error) {
    next(error);
  }
};
