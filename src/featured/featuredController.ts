import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const { JWT_SECRET } = process.env;
const prisma = new PrismaClient();

export const all = async (req: Request, res: Response) => {};
export const create = async (req: Request, res: Response) => {};
export const single = async (req: Request, res: Response) => {};
export const update = async (req: Request, res: Response) => {};
export const remove = async (req: Request, res: Response) => {};
