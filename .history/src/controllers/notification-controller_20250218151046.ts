import Notification from "../models/notification-schema";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { populate } from "dotenv";

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
      const notification = await Notification.find({})
        .populate("sender", "username image")
        .sort({ createAt: -1 });

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
