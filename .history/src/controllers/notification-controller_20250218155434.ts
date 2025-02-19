import Notification from "../models/notification-schema";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import mongoose from "mongoose";

export const getUserNotifications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const newReceipient = new mongoose.Types.ObjectId(userId.toString());
      console.log(newReceipient);

      const notification = await Notification.find({
        recipient: newReceipient,
      });

      console.log("Retrieved notification", notification);
      res.status(200).json(notification);
    } catch (error) {
      console.error("Something went wrong!", error);

      res.status(500).json({
        success: false,
        message: "Something went wrong!",
      });
    }
  }
);
