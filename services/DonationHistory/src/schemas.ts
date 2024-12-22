import { DONATION_ACTIVITY_STATUS } from "@prisma/client";
import { z } from "zod";

export const CreateDonationHistoryDTOSchema = z.object({
  type: z
    .nativeEnum(DONATION_ACTIVITY_STATUS)
    .default(DONATION_ACTIVITY_STATUS.REQUEST),
  message: z.string(),
  requestId: z.string(),
});
