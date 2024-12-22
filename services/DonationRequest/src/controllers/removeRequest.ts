import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

export const remove = async (
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
      where: { id: req.params.id },
      data: { deleteAt: new Date() },
    });

    // todo create delete history
    // todo create notification for requested id

    return res.status(204).json({
      message: "Featured Item deleted successfully!",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export default remove;
