import { Request, Response, RequestHandler } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user-schema";
import asyncHandler from "express-async-handler";

export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: "User already exist!",
        });
      }

      const salt = await bcryptjs.genSalt(12);

      const hashedPassword = await bcryptjs.hash(password, salt);

      const user = new User({
        username,
        email,
        password: hashedPassword,
      });

      await user.save();

      res.status(200).json({
        success: true,
        message: "User register successfully!",
        user,
      });
    } catch (error) {
      console.error("Internal server error", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user || !(await bcryptjs.compare(password, user.password))) {
        res.status(400).json({
          success: false,
          message: "Invalid credentials! Please try again",
        });
      }

      const accessToken = jwt.sign(
        {
          userId: user?._id,
          email: user?.email,
        },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: "1d",
        }
      );

      res.status(200).json({
        success: true,
        message: "User login successfully!",
        accessToken,
        user,
      });
    } catch (error) {
      console.error("Internal server error", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);
