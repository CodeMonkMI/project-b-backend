import { PrismaClient, blood_type, donation_status } from "@prisma/client";
import { Request, Response } from "express";
import { internalServerError } from "../helpers/errorResponses";

const prisma = new PrismaClient();

interface AllReqQuery {
  status?: donation_status;
  limit?: number;
}
export const all = async (
  req: Request<{}, {}, {}, AllReqQuery>,
  res: Response
) => {
  try {
    const { status = "request", limit = 10 } = req.query;
    const data = await prisma.donationRequested.findMany({
      where: {
        status,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return res.status(200).json({
      message: "Request was successful!",
      data: data,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

interface CreateReqBody {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address: string;
  date: string;
  blood: blood_type;
  reason: string;
  emailUserId: string;
}

export const create = async (
  req: Request<{}, {}, CreateReqBody>,
  res: Response
) => {
  const {
    firstName,
    lastName,
    email = null,
    phone,
    address,
    date,
    blood,
    reason,
    emailUserId = null,
  } = req.body;
  try {
    const item = await prisma.donationRequested.create({
      data: {
        address,
        blood,
        date,
        email,
        status: "request",
        firstName,
        lastName,
        phone,
        reason,
        requestedById: emailUserId,
      },
      select: {
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
      },
    });

    return res.status(201).json({
      message:
        "You request accepted! We will let you know via email or call you directly!",
      data: item,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const single = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const single = await prisma.donationHistory.findUnique({
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

interface UpdateReqBody {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address: string;
  date: string;
  blood: blood_type;
  reason: string;
}

export const update = async (
  req: Request<{ id: string }, {}, UpdateReqBody>,
  res: Response
) => {
  const {
    firstName,
    lastName,
    email = null,
    phone,
    address,
    date,
    blood,
    reason,
  } = req.body;
  try {
    const item = await prisma.donationRequested.update({
      where: {
        id: req.params.id,
      },
      data: {
        address,
        blood,
        date,
        email,
        status: "request",
        firstName,
        lastName,
        phone,
        reason,
      },
    });

    return res.status(201).json({
      message: "Donation request updated!",
      data: item,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const remove = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.donationRequested.update({
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
