import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { internalServerError } from "../helpers/errorResponses";

const prisma = new PrismaClient();

export const all = async (req: Request, res: Response) => {
  try {
    const role = (req.user as any)?.role?.role;
    console.log(req.user);

    const data = await prisma.donationActivity.findMany({
      where: {
        ...(role !== "admin" &&
          role !== "super_admin" && {
            request: {
              requestedBy: {
                id: (req.user as any)?.id,
              },
            },
          }),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
        message: true,
        type: true,
        id: true,
      },
    });

    console.log();

    return res.status(200).json({
      message: "Request was successful!",
      data: data,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const single = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const single = await prisma.donationActivity.findUnique({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Request was successful!",
      data: single,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const remove = async (req: Request<{ id: string }>, res: Response) => {
  try {
    await prisma.donationActivity.update({
      where: { id: req.params.id },
      data: { deleteAt: new Date() },
    });

    return res.status(204).json({
      message: "History deleted successfully!",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
