import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { internalServerError } from "../helpers/errorResponses";

const { JWT_SECRET } = process.env;
const prisma = new PrismaClient();

const userSelection = {
  select: {
    Profile: {
      select: {
        image: true,
        firstName: true,
        lastName: true,
        displayName: true,
        bloodGroup: true,
        zila: true,
      },
    },
    DonationGivenHistory: {
      select: {
        id: true,
      },
    },
  },
};

export const all = async (req: Request, res: Response) => {
  try {
    const featuredList = await prisma.featured.findMany({
      where: {
        OR: [
          {
            OR: [
              { start: null },
              {
                start: {
                  gte: new Date(),
                },
              },
            ],
          },
          {
            OR: [
              { end: null },
              {
                end: {
                  lte: new Date(),
                },
              },
            ],
          },
        ],
      },
      select: {
        user: { ...userSelection },
      },
    });

    return res.status(200).json({
      message: "Request was successful!",
      data: featuredList,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

interface CreateReqBody {
  userId: string;
  start?: string;
  end?: string;
}

export const create = async (
  req: Request<{}, {}, CreateReqBody>,
  res: Response
) => {
  const { userId, end, start } = req.body;
  try {
    const featured = await prisma.featured.create({
      data: {
        userId,
        end: end || null,
        start: start || null,
      },
      select: {
        user: { ...userSelection },
      },
    });

    return res.status(201).json({
      message: "Featured added successful!",
      data: featured,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const single = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const featuredList = await prisma.featured.findUnique({
      where: { id },
      select: {
        user: { ...userSelection },
      },
    });

    return res.status(200).json({
      message: "Request was successful!",
      data: featuredList,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

interface UpdateReqBody {
  start?: string;
  end?: string;
}

export const update = async (
  req: Request<{ id: string }, {}, UpdateReqBody>,
  res: Response
) => {
  const { end, start } = req.body;
  try {
    const featured = await prisma.featured.update({
      where: {
        id: req.params.id,
      },
      data: {
        end: end || null,
        start: start || null,
      },
      select: {
        user: { ...userSelection },
      },
    });

    return res.status(201).json({
      message: "Featured data updated successful!",
      data: featured,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const remove = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.featured.update({
      where: { id },
      data: { deleteAt: new Date() },
    });

    return res.status(204).json({
      message: "Featured Item deleted successfully!",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
