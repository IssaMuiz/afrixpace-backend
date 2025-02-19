import { Request, Response } from "express";
import User from "../models/user-schema";
import Post from "../models/post-schema";
import asyncHandler from "express-async-handler";

export const search = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, type } = req.query;

      if (!query) {
        res.status(400).json({
          success: false,
          message: "Search query is required!",
        });
      }

      const searchRegex = new RegExp(query?.toString() || "", "i");

      let results = [];

      if (type === "users") {
        results = await User.find({ username: searchRegex }).select(
          "username image"
        );
      } else if (type === "posts") {
        results = await Post.find({ title: searchRegex }).select(
          "title content media"
        );
      } else {
        res.status(400).json({
          success: false,
          message: "Invalid search type use 'users' or 'posts'",
        });
      }
    } catch (error) {
      console.error("Something went wrong!", error);

      res.status(500).json({
        success: false,
        message: "Something went wrong!",
      });
    }
  }
);
