import { Request, Response, RequestHandler } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user-schema";
import asyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import { IsPathDefaultUndefined } from "mongoose/types/inferschematype";


const generateToken =(userId: ObjectId | undefined, email: string | undefined) =>{
  return jwt.sign(
    {
      userId,
      email
    },
    process.env.JWT_SECRET_KEY!,
    {
      expiresIn: "1d",
    }
  );
} 

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


      res.status(200).json({
        success: true,
        message: "User login successfully!",
        user,
        token: generateToken(user?._id , user?.email)
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


export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> {

})