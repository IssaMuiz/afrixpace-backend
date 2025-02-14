import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User, { UserDocument } from "../models/user-schema";
import asyncHandler from "express-async-handler";

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

export const authMiddleware = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

      const user = await User.findById(decoded._id);

      if (!user) {
        res.json({
          success: false,
          message: "User not found",
        });
      }

      console.log(decoded);

      req.user = user as UserDocument;

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
