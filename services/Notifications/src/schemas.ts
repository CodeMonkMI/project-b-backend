import { NOTIFICATION_TYPE } from "@prisma/client";
import { z } from "zod";

export const NotificationDTOSchema = z.object({
  type: z.nativeEnum(NOTIFICATION_TYPE).default("REQUEST"),
  message: z.string().min(10).max(255),
  receivers: z.string().array().optional().default([]),
});
