import Post from "../models/post-schema";
import User from "../models/user-schema";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

export const createPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, content, category } = req.body;

      const file = req.file;

      if (!title || !content || !category) {
        res.status(400).json({
          success: false,
          message: "All fields are required!",
        });
        return;
      }

      const createPost = new Post({
        user,
        title,
        content,
        media,
        category,
      });

      await createPost.save();

      res.status(200).json({
        success: true,
        message: "Post created successfully!",
        createPost,
      });
    } catch (error) {
      console.error("Something went wrong", error);

      res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  }
);
