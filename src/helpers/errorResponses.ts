// const { validationResult } = require('express-validator');
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
export const internalServerError = async (res: Response, error: any) => {
  console.log(error);
  return res.status(500).json({
    message: "Internal Server Error",
  });
};
export const errorResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req).formatWith((error) => error.msg);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.mapped());
  }
  return next();
};
