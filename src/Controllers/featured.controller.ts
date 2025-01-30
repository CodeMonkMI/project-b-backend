import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { internalServerError } from "../helpers/errorResponses";

interface CreateReqBody {
  userId: string;
  start?: string;
  end?: string;
}
interface UpdateReqBody {
  start?: string;
  end?: string;
}
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

export class FeaturedController {
  constructor(private readonly prisma: PrismaClient) {}
  async all(req: Request, res: Response) {
    try {
      const featuredList = await this.prisma.featured.findMany({
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
  }

  async create(req: Request<{}, {}, CreateReqBody>, res: Response) {
    const { userId, end, start } = req.body;
    try {
      const featured = await this.prisma.featured.create({
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
  }

  async single(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const featuredList = await this.prisma.featured.findUnique({
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
  }

  async update(req: Request<{ id: string }, {}, UpdateReqBody>, res: Response) {
    const { end, start } = req.body;
    try {
      const featured = await this.prisma.featured.update({
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
  }

  async remove(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      await this.prisma.featured.update({
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
  }
}
