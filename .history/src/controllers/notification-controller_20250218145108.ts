import Notification from "../models/notification-schema";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

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
      const notification = await Notification.find({
        recipient: userId,
      });

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
