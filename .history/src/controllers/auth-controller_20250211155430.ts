import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user-schema";

const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
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
};
