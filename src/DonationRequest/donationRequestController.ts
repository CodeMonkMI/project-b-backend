import { PrismaClient, blood_type, donation_status } from "@prisma/client";
import { endOfMonth, startOfMonth } from "date-fns";
import { Request, Response } from "express";
import {
  createActivity,
  generateDonationActivityMessage,
} from "../DonationActivity/donationActivityFunction";
import { internalServerError } from "../helpers/errorResponses";

const prisma = new PrismaClient();

const SELECT_REQUEST = {
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
  requestedById: true,
  requestedBy: {
    select: {
      username: true,
      Profile: {
        select: {
          firstName: true,
          lastName: true,
          id: true,
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
          firstName: true,
          lastName: true,
        },
      },
    },
  },
};

interface AllReqQuery {
  status?: donation_status;
  limit?: number;
}
export const all = async (
  req: Request<{}, {}, {}, AllReqQuery>,
  res: Response
) => {
  const role = (req.user as any)?.role?.role;

  try {
    const data = await prisma.donationRequested.findMany({
      where: {
        OR: [{ deleteAt: { isSet: false } }, { deleteAt: null }],
        ...(role !== "admin" &&
          role !== "super_admin" && {
            requestedById: (req.user as any)?.id,
          }),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        ...SELECT_REQUEST,
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
        ...SELECT_REQUEST,
      },
    });

    await createActivity({
      type: "request",
      message: generateDonationActivityMessage.request(
        `${firstName} ${lastName}`,
        blood,
        address
      ),
      userId: user?.id,
      requestedId: item.id,
    });
    if (user) {
      await createActivity({
        type: "approve",
        message: `A request was automatically approved for ${firstName} ${lastName} `,
        userId: user?.id,
        requestedId: item.id,
      });
    }

    // create notification
    const admins = await prisma.user.findMany({
      where: {
        role: {
          OR: [{ role: "admin" }, { role: "super_admin" }],
        },
      },
      select: {
        id: true,
      },
    });

    const authUserId = (req.user as any).id;
    await prisma.notification.createMany({
      data: [
        {
          message: user
            ? `${firstName} ${lastName} request a blood of ${blood} is approved automatically!`
            : `${firstName} ${lastName} request a blood of ${blood}. Approval required!`,
          createdById: authUserId,
          receiverId: admins.map((i) => i.id),
        },
        {
          message: user
            ? `You request is approved! We will let you updated!`
            : `We have received your request of ${blood} blood. We will let you updated!`,
          createdById: authUserId,
          receiverId: [authUserId],
        },
      ],
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
    const item = await prisma.donationRequested.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: "progress",
      },
      select: {
        ...SELECT_REQUEST,
      },
    });
    const user: any = req.user;

    await createActivity({
      type: "approve",
      message: generateDonationActivityMessage.approve(
        `${user.Profile.firstName} ${user.Profile.lastName} (${user.username})`,
        `${item.firstName} ${item.lastName}`
      ),
      userId: user?.id,
      requestedId: item.id,
    });

    // create notification
    await prisma.notification.createMany({
      data: [
        {
          message: `${item.requestedBy?.Profile?.firstName} ${item.requestedBy?.Profile?.lastName} request (${item.id}) a blood of ${item.blood} is approved by an admin!`,
          createdById: user.id,
          receiverId: [user.id],
        },
      ],
    });

    return res.status(202).json({
      message: "Donation request approved!",
      data: null,
    });
  } catch (error) {
    internalServerError(res, error);
  }
};
interface CompleteReqBody {
  donor: string;
}
export const complete = async (
  req: Request<{ id: string }, {}, CompleteReqBody>,
  res: Response
) => {
  try {
    const donationRequest = await prisma.donationRequested.findFirst({
      where: {
        id: req.params.id,
        status: "ready",
        AND: [{ donorId: { isSet: true } }, { donorId: { not: null } }],
      },
      select: {
        donorId: true,
      },
    });

    if (!donationRequest || !donationRequest.donorId) {
      return res.status(400).json({
        message: "Invalid Request!",
        data: donationRequest,
      });
    }

    const item = await prisma.donationRequested.update({
      where: {
        id: req.params.id,
        status: "ready",
      },
      data: {
        status: "completed",
        donor: {
          update: {
            Profile: {
              update: {
                lastDonation: new Date(),
              },
            },
          },
        },
      },
      select: { ...SELECT_REQUEST },
    });

    const user: any = req.user;
    await createActivity({
      type: "completed",
      message: generateDonationActivityMessage.completed(
        `${item.donor?.Profile?.firstName} ${item.donor?.Profile?.lastName}`,
        `${item?.firstName} ${item?.lastName}`,
        item.address,
        `${user.Profile.firstName} ${user.Profile.lastName}(${user.username})`
      ),
      userId: user?.id,
      requestedId: item.id,
    });

    // create notification
    await prisma.notification.createMany({
      data: [
        {
          message: `${item.requestedBy?.Profile?.firstName} ${item.requestedBy?.Profile?.lastName} request (${item.id}) a blood of ${item.blood} is completed now!`,
          createdById: user.id,
          receiverId: item.requestedBy?.Profile?.id == user.id ? [user.id] : [],
        },
        {
          message: `You have successfully given a blood. You saved a life with you blood. Respect for you!`,
          createdById: user.id,
          receiverId: [item.donor?.id],
        },
      ],
    });

    return res.status(200).json({
      message: "Donation request completed!",
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
    const id = req.params.id;
    const item = await prisma.donationRequested.update({
      where: {
        id,
      },
      data: {
        status: "declined",
      },
      select: {
        ...SELECT_REQUEST,
      },
    });

    const user: any = req.user;
    await createActivity({
      type: "declined",
      message: generateDonationActivityMessage.declined(
        `${user.Profile.firstName} ${user.Profile.lastName}(${user.username})`
      ),
      userId: user?.id,
      requestedId: id,
    });

    // create notification
    await prisma.notification.createMany({
      data: [
        {
          message: `${item.requestedBy?.Profile?.firstName} ${item.requestedBy?.Profile?.lastName} request (${item.id}) a blood of ${item.blood} is declined by an admin!`,
          createdById: user.id,
          receiverId: item?.requestedById ? [item.requestedById] : [],
        },
      ],
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
    const item = await prisma.donationRequested.update({
      where: {
        id,
      },
      data: {
        status: "progress",
        donorId: null,
      },
      select: {
        id: true,
        blood: true,
        requestedById: true,
        requestedBy: {
          select: {
            Profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const user: any = req.user;
    await createActivity({
      type: "progress",
      message: generateDonationActivityMessage.progress(
        `${user.Profile.firstName} ${user.Profile.lastName}(${user.username})`
      ),
      userId: user?.id,
      requestedId: id,
    });

    // create notification
    await prisma.notification.createMany({
      data: [
        {
          message: `${item.requestedBy?.Profile?.firstName} ${item.requestedBy?.Profile?.lastName} request (${item.id}) a blood of ${item.blood} is in progress!`,
          createdById: user.id,
          receiverId: item.requestedById ? [item.requestedById] : [],
        },
      ],
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

    const item = await prisma.donationRequested.update({
      where: { id },
      data: { donorId: donor, status: "ready" },
      select: { ...SELECT_REQUEST, donorId: true },
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

    const user: any = req.user;
    await createActivity({
      type: "ready",
      message: generateDonationActivityMessage.ready(
        `${item.donor?.Profile?.firstName} ${item.donor?.Profile?.lastName}`,
        `${item.firstName} ${item.lastName}`,
        `${user.Profile.firstName} ${user.Profile.lastName}(${user.username})`
      ),
      userId: user?.username,
      requestedId: item.id,
    });

    // create notification
    await prisma.notification.createMany({
      data: [
        {
          message: `${item.requestedBy?.Profile?.firstName} ${item.requestedBy?.Profile?.lastName}, a donor is ready to give blood for request (${item.id}) a blood of ${item.blood}`,
          createdById: user.id,
          receiverId: item.requestedById ? [item.requestedById] : [],
        },
        {
          message: `You are being selected to give blood for ${item.requestedBy?.Profile?.firstName} ${item.requestedBy?.Profile?.lastName} request (${item.id})!`,
          createdById: user.id,
          receiverId: [donor],
        },
      ],
    });

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

    const item = await prisma.donationRequested.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: "hold",
        donorId: null,
      },
      select: {
        ...SELECT_REQUEST,
      },
    });

    const user: any = req.user;
    await createActivity({
      type: "hold",
      message: generateDonationActivityMessage.hold(
        `${user.Profile.firstName} ${user.Profile.lastName} (${user.username})`
      ),
      userId: user?.id,
      requestedId: id,
    });

    // create notification
    await prisma.notification.createMany({
      data: [
        {
          message: `${item.requestedBy?.Profile?.firstName} ${item.requestedBy?.Profile?.lastName} request (${item.id}) a blood of ${item.blood} is in progress!`,
          createdById: user.id,
          receiverId: item.requestedById ? [item.requestedById] : [],
        },
      ],
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
    const item = await prisma.donationRequested.update({
      where: { id },
      data: { deleteAt: new Date() },
      select: {
        ...SELECT_REQUEST,
      },
    });
    const user: any = req.user;
    await createActivity({
      type: "deleted",
      message: generateDonationActivityMessage.deleted(
        `${user.Profile.firstName} ${user.Profile.lastName}(${user.username})`
      ),
      userId: user?.id,
      requestedId: id,
    });
    // create notification
    await prisma.notification.createMany({
      data: [
        {
          message: `${item.requestedBy?.Profile?.firstName} ${item.requestedBy?.Profile?.lastName} request (${item.id}) a blood of ${item.blood} is in progress!`,
          createdById: user.id,
          receiverId: item.requestedById ? [item.requestedById] : [],
        },
      ],
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
export const userContribution = async (
  req: Request<{ username: string }, {}, FindReqBody>,
  res: Response
) => {
  const username = req.params.username;

  try {
    // Get the start and end of the current month
    const startOfCurrentMonth = startOfMonth(new Date());
    const endOfCurrentMonth = endOfMonth(new Date());

    // Count donations given by the user
    const donationCount = await prisma.donationRequested.aggregate({
      _count: true,
      where: {
        status: "completed",
        donor: {
          username,
        },
      },
    });

    const donationCountThisMonth = await prisma.donationRequested.aggregate({
      _count: true,
      where: {
        status: "completed",
        donor: {
          username,
        },
        createdAt: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
    });

    // Count donation requests by the user
    const requestCount = await prisma.donationRequested.aggregate({
      _count: true,
      where: {
        requestedBy: {
          username,
        },
      },
    });

    const requestCountThisMonth = await prisma.donationRequested.aggregate({
      _count: true,
      where: {
        requestedBy: {
          username,
        },
        createdAt: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
    });

    // Return the aggregated data
    const data = {
      donation: {
        month: donationCountThisMonth._count,
        total: donationCount._count,
      },
      ref: {
        month: requestCountThisMonth._count,
        total: requestCount._count,
      },
    };
    return res
      .status(200)
      .json({ message: "Stats generated successfully", data });
  } catch (error) {
    internalServerError(res, error);
  }
};
