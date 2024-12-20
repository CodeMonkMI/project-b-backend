import prisma from "@/prisma";
import { NextFunction, Request, Response } from "express";

export const remove = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
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
