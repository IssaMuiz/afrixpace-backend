import mongoose from "mongoose";
import { Request, Response } from "express";
import User from "../models/user-schema";
import asyncHandler from "express-async-handler";
import { request } from "http";

export const followUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
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

      user!.following = user?.following || [];
      userToFollow!.followers = userToFollow?.followers || [];

      if (
        user?.following?.includes(userToFollow?._id as mongoose.Types.ObjectId)
      ) {
        res.status(400).json({
          success: false,
          message: "Already following this user",
        });
      }

      user?.following?.push(userToFollow?._id as mongoose.Types.ObjectId);

      userToFollow?.followers?.push(user?._id as mongoose.Types.ObjectId);

      await user?.save();
      await userToFollow?.save();
      res.status(200).json({
        success: true,
        message: `You are not following ${userToFollow?.username}`,
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

      user!.following = user?.following || [];
      userToUnfollow!.followers = userToUnfollow?.followers || [];

      if (
        !user?.following.includes(
          userToUnfollow?._id as mongoose.Types.ObjectId
        )
      ) {
        res.status(400).json({
          success: false,
          message: "You are not following this user",
        });
      }

      user!.following = (user?.following ?? []).filter(
        (id) => id.toString() !== unFollowId
      );

      userToUnfollow!.followers = (userToUnfollow?.followers ?? []).filter(
        (id) => id.toString !== userId
      );

      await user?.save();
      await userToUnfollow?.save();

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
