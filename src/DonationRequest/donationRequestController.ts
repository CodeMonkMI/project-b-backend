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
    const data = await prisma.donationRequested.findMany({
      where: {
        OR: [{ deleteAt: { isSet: false } }, { deleteAt: null }],
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        address: true,
        blood: true,
        createdAt: true,
        date: true,
        email: true,
        firstName: true,
        id: true,
        lastName: true,
        phone: true,
        reason: true,
        status: true,
        updatedAt: true,
        requestedBy: {
          select: {
            username: true,
            Profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        donor: {
          select: {
            id: true,
            username: true,
            email: true,
            Profile: {
              select: {
                phoneNo: true,
              },
            },
          },
        },
      },
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
  const user: any = req.user;
  try {
    const item = await prisma.donationRequested.create({
      data: {
        address,
        blood,
        date,
        email,
        status: user ? "progress" : "request",
        firstName,
        lastName,
        phone,
        reason,
        requestedById: user?.id || emailUserId || null,
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
    console.log(id);
    const single = await prisma.donationRequested.findUnique({
      where: {
        id,
      },
      select: {
        address: true,
        blood: true,
        createdAt: true,
        date: true,
        email: true,
        firstName: true,
        id: true,
        lastName: true,
        phone: true,
        reason: true,
        status: true,
        updatedAt: true,
        requestedBy: {
          select: {
            username: true,
            Profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        donor: {
          select: {
            id: true,
            username: true,
            email: true,
            Profile: {
              select: {
                phoneNo: true,
              },
            },
          },
        },
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

export const approve = async (
  req: Request<{ id: string }, {}, AssignReqBody>,
  res: Response
) => {
  try {
    await prisma.donationRequested.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: "progress",
      },
    });

    return res.status(202).json({
      message: "Donation request approved!",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
export const decline = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response
) => {
  try {
    await prisma.donationRequested.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: "declined",
      },
    });

    return res.status(202).json({
      message: "Donation request approved!",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
export const progress = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response
) => {
  try {
    const id = req.params.id;
    const findRequest = await prisma.donationRequested.findFirst({
      where: {
        id,
      },
    });
    // disconnect previously connected donor if exist
    if (findRequest?.donorId) {
      await prisma.user.update({
        where: { id: findRequest.donorId },
        data: {
          DonationGiven: {
            disconnect: {
              id,
              status: "ready",
            },
          },
        },
      });
    }
    await prisma.donationRequested.update({
      where: {
        id,
      },
      data: {
        status: "progress",
        donorId: null,
      },
    });

    return res.status(202).json({
      message: "Donation status updated!",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

interface AssignReqBody {
  donor: string;
}

export const assign = async (
  req: Request<{ id: string }, {}, AssignReqBody>,
  res: Response
) => {
  const { donor } = req.body;
  const id = req.params.id;
  try {
    const findRequest = await prisma.donationRequested.findFirst({
      where: {
        AND: [{ id }, { OR: [{ status: "progress" }, { status: "ready" }] }],
      },
    });
    if (!findRequest) {
      return res.status(404).json({
        message: "Request not found!",
        data: null,
      });
    }

    // disconnect previously connected donor if exist
    if (findRequest.donorId) {
      await prisma.user.update({
        where: { id: findRequest.donorId },
        data: {
          DonationGiven: {
            disconnect: {
              id,
              status: "ready",
            },
          },
        },
      });
    }

    await prisma.donationRequested.update({
      where: { id },
      data: { donorId: donor, status: "ready" },
    });

    // update user
    await prisma.user.update({
      where: {
        id: donor,
      },
      data: {
        DonationGiven: {
          connect: {
            id,
          },
        },
      },
    });

    const donorData = await prisma.user.findUnique({
      where: {
        id: donor,
      },
      select: {
        id: true,
        username: true,
        email: true,
        Profile: {
          select: {
            phoneNo: true,
          },
        },
      },
    });
    console.log(donorData);
    return res.status(200).json({
      message: "Donor assigned successfully",
      data: donorData,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};

export const hold = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response
) => {
  try {
    const id = req.params.id;
    const findRequest = await prisma.donationRequested.findFirst({
      where: {
        id,
      },
    });
    // disconnect previously connected donor if exist
    if (findRequest?.donorId) {
      await prisma.user.update({
        where: { id: findRequest.donorId },
        data: {
          DonationGiven: {
            disconnect: {
              id,
              status: "ready",
            },
          },
        },
      });
    }

    await prisma.donationRequested.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: "hold",
        donorId: null,
      },
    });

    return res.status(202).json({
      message: "Donation status updated!",
      data: null,
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

interface FindReqBody {
  blood: blood_type;
  date: string;
}

export const findDonor = async (
  req: Request<{}, {}, FindReqBody>,
  res: Response
) => {
  const { date, blood } = req.body;
  const { BLOOD_DONATION_BREAK = 5 }: any = process.env;
  const fiveMonthsAgo = new Date(date);
  fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - BLOOD_DONATION_BREAK);

  try {
    const donationRequests = await prisma.user.findMany({
      where: {
        isVerified: true,
        OR: [{ deleteAt: { isSet: false } }, { deleteAt: null }],
        Profile: {
          bloodGroup: blood,
          OR: [
            { lastDonation: { isSet: false } },
            { lastDonation: { lte: fiveMonthsAgo } },
          ],
        },
        DonationGiven: {
          none: {
            status: "ready",
          },
        },
      },
      select: {
        id: true,
        username: true,
        Profile: {
          select: {
            bloodGroup: true,
            address: true,
            zila: true,
            upzila: true,
            displayName: true,
            firstName: true,
            lastName: true,
            phoneNo: true,
          },
        },
      },
    });

    return res.status(200).json({
      message:
        "You request accepted! We will let you know via email or call you directly!",
      data: donationRequests,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
