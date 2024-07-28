import {
  blood_type,
  donation_activity_status,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

interface DataTypes {
  request: (user_name: string, blood_name: blood_type, place: string) => string;
  approve: (user_name: string, requesterName: string) => string;
  progress: (user_name: string) => string;
  ready: (donor_name: string, request_name: string, user: string) => string;
  hold: (user_name: string) => string;
  completed: (
    user_name: string,
    request_name: string,
    place: string,
    user: string
  ) => string;
  declined: (user_name: string) => string;
  deleted: (user_name: string) => string;
}

export const generateDonationActivityMessage: DataTypes = {
  request: (user_name: string, blood_name: blood_type, place: string) => {
    return `${user_name} requested ${blood_name} blood at ${place}`;
  },
  approve: (user_name: string, requesterName: string) => {
    return `${user_name} approve a request of ${requesterName}`;
  },
  progress: (user_name: string) => {
    return `${user_name} make request to progress`;
  },
  ready: (donor_name: string, request_name: string, user: string) => {
    return `${donor_name} is ready to donate blood for ${request_name}. Updated By ${user}`;
  },
  hold: (user_name: string) => {
    return `${user_name} hold a request`;
  },
  completed: (
    user_name: string,
    request_name: string,
    place: string,
    user: string
  ) => {
    return `${user_name} give blood to ${request_name} at ${place}. Updated By ${user}`;
  },
  declined: (user_name: string) => {
    return `${user_name} decline a request`;
  },
  deleted: (user_name: string) => {
    return `${user_name} deleted a request`;
  },
};

export const createActivity = async ({
  type,
  message,
  userId,
  requestedId,
}: {
  type: donation_activity_status;
  message: string;
  userId: any;
  requestedId: string;
}) => {
  await prisma.donationActivity.create({
    data: {
      type,
      message,
      createdById: userId,
      requestId: requestedId,
    },
  });
};
