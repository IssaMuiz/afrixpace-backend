import mongoose from "mongoose";
import { Request, Response } from "express";
import User from "../models/user-schema";
import asyncHandler from "express-async-handler";
import { sendNotification } from "../utils/notification-helper";
import { Server } from "socket.io";

export const followUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const io: Server = (req as any).io;

      const userId = req.user?.id;
      const { followId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(followId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const user = await User.findById(userId);
      const userToFollow = await User.findById(followId);

      if (!user || !userToFollow) {
        res.status(404).json({
          success: false,
          message: "User not found!",
        });
      }

      if (user === userToFollow) {
        res.status(400).json({
          success: false,
          message: "You can't follow yourself",
        });
      }

      const userFollowingSet = new Set(
        user?.following?.map((id) => id.toString()) ?? []
      );

      const userFollowerSet = new Set(
        userToFollow?.followers?.map((id) => id.toString()) ?? []
      );

      if (userFollowingSet.has(followId)) {
        res.status(400).json({
          success: false,
          message: "You already following this user",
        });
      }

      userFollowingSet.add(followId);
      userFollowerSet.add(userId);

      user!.following = Array.from(userFollowingSet).map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      userToFollow!.followers = Array.from(userFollowerSet).map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      await user?.save();
      await userToFollow?.save();

      sendNotification(
        userToFollow?._id as mongoose.Types.ObjectId,
        userId,
        "FOLLOW",
        `${user?.username} started following you`,
        io
      );
      res.status(200).json({
        success: true,
        message: `You are now following ${userToFollow?.username}`,
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

export const unFollowUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const io: Server = (req as any).io;

      const { unFollowId } = req.body;
      const userId = req.user?.id;

      if (!mongoose.Types.ObjectId.isValid(unFollowId)) {
        res.status(400).json({
          success: false,
          message: "The user ID is not valid",
        });
      }

      if (userId === unFollowId) {
        res.status(400).json({
          success: false,
          message: "You can't unfollow yourself",
        });
      }

      const user = await User.findById(userId);
      const userToUnfollow = await User.findById(unFollowId);

      if (!user || !userToUnfollow) {
        res.status(404).json({
          success: false,
          message: "User cannot be found!",
        });
      }

      const userFollowingSet = new Set(
        user?.following?.map((id) => id.toString()) ?? []
      );

      const userFollowerSet = new Set(
        userToUnfollow?.followers?.map((id) => id.toString()) ?? []
      );

      if (!userFollowingSet.has(unFollowId)) {
        res.status(400).json({
          success: false,
          message: "You are not following this user",
        });
      }

      userFollowingSet.delete(unFollowId);
      userFollowerSet.delete(userId);

      user!.following = Array.from(userFollowingSet).map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      userToUnfollow!.followers = Array.from(userFollowerSet).map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      await user?.save();
      await userToUnfollow?.save();

      sendNotification(
        unFollowId,
        userId,
        "UNFOLLOW",
        `${user?.username} unfollow you`,
        io
      );

      res.status(200).json({
        success: true,
        message: `You have unfollowed ${userToUnfollow?.username}`,
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

export const getFollowers = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).populate(
        "followers",
        "username email"
      );

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User cannot be found!",
        });
      }

      res.status(200).json({
        success: true,
        followers: user?.followers,
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
export const getFollowing = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).populate(
        "following",
        "username email"
      );

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User cannot be found!",
        });
      }

      res.status(200).json({
        success: true,
        following: user?.following,
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
