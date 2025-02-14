import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/user-schema";
import asyncHandler from "express-async-handler";

export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];

    console.log(authHeader);

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.json({
        success: false,
        message: "Access denied! No token provided, Please login",
      });
    }

    try {
      const decoded = jwt.verify(
        token as string,
        process.env.JWT_SECRET_KEY!
      ) as JwtPayload;

      const user = await User.findById(decoded.id);

      if (!user) {
        res.json({
          success: false,
          message: "User not found",
        });
      }
      console.log(decoded);
      req.user = user;

      next();
    } catch (error) {
      console.error("Invalid Token");

      res.status(401).json({
        success: false,
        message: "Invalid Token",
      });
    }
  }
);
