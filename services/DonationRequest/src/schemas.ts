import { BLOOD_TYPE } from "@prisma/client";
import { z } from "zod";

export const CreateDonationRequestDTOSchema = z.object({
  firstName: z.string().min(3).max(50),
  lastName: z.string().min(3).max(50),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15),
  address: z.string().min(10).max(200),
  date: z.date(),
  blood: z.nativeEnum(BLOOD_TYPE),
  reason: z.string().min(5).max(200),
  emailUserId: z.string().optional(),
});
