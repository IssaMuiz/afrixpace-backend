import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../models/user-schema";
import asyncHandler from "express-async-handler";
import { generateToken } from "../utils/generateToken";

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

      if (!user || !(await bcryptjs.compare(password, user?.password))) {
        res.status(400).json({
          success: false,
          message: "Invalid credentials! Please try again",
        });
      }

      res.status(200).json({
        success: true,
        message: "User login successfully!",
        _id: user?.id,
        username: user?.username,
        email: user?.email,
        password: user?.password,
        token: generateToken(user?._id),
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

export const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ success: true, message: "Logged out successfully" });
  }
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(404).json({ success: true, message: "No token provided" });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY!
      ) as JwtPayload;

      const newToken = generateToken(decoded.id);

      res.json({ success: true, token: newToken });
    } catch (error) {
      console.error("Invalid or expired token", error);

      res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  }
);

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.user;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  }
);
