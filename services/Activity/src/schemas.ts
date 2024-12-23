import { ActivityStatus } from "@prisma/client";
import { z } from "zod";

export const ActivityDTOSchema = z.object({
  type: z.nativeEnum(ActivityStatus).optional(),
  message: z.string(),
  user: z.string(),
});
