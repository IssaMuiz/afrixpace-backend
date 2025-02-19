import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { UserDocument } from "../models/user-schema";
import asyncHandler from "express-async-handler";
import { generateToken } from "../utils/generateToken";
import redis from "../config/redis";

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

      req.session.user = {
        id: user?._id.toString() || "",
        email: user?.email || "",
      };

      const token = jwt.sign(
        {
          userId: user?._id,
        },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: "1d",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24,
      });

      res.status(200).json({
        success: true,
        message: "User log in successfully!",
        user: req.session.user,
        token,
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
    req.session.destroy((err) => {
      if (err) return;

      res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    });

    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(404).json({ success: true, message: "No token provided" });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET_KEY!
      ) as JwtPayload;

      const newToken = generateToken(decoded.id);

      res.status(200).json({ success: true, token: newToken });
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
    /* const cacheKey = `user:${req.user!.id}`;

    const cachedUser = await redis.get(cacheKey);

    if (cachedUser) {
      res.status(200).json(JSON.parse(cachedUser));
    } */

    const user = await User.findById(req.user!.id).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    /* await redis.setex(cacheKey, 600, JSON.stringify(user)) */

    res.status(200).json({
      success: true,
      user,
    });
  }
);

export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, image, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      {
        username,
        image,
        bio,
      },
      { new: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    /* await redis.del(`user:${req.user!.id}`); */

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user,
    });
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { oldPassword, newPassword } = req.body;

      const user = await User.findById(req.user!.id);

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      if (oldPassword === newPassword) {
        res.status(401).json({
          success: false,
          message: "Old password cannot be given as the new password",
        });
      }

      const isPasswordMatched = await bcryptjs.compare(
        oldPassword,
        user?.password as string
      );

      if (!isPasswordMatched) {
        res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }
      const salt = await bcryptjs.genSalt(12);

      const newlyHashedPassword = await bcryptjs.hash(newPassword, salt);

      user!.password = newlyHashedPassword as string;

      await user?.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
        user,
      });
    } catch (error) {
      console.error("Something went wrong!", error);
      res.status(500).json({
        success: false,
        message: "Something went wrong!",
      });
    }
  }
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "No user found!",
      });
    }

    const resetToken = generateToken(user?._id);

    //Here, you would send an email with the resetToken (using nodemailer)
    console.log(
      `Reset link: http://localhost:5000/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent successfully!",
    });
  }
);
