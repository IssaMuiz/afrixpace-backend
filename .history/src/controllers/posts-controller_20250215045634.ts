import Post from "../models/post-schema";
import User from "../models/user-schema";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

export const createPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, content, media, category } = req.body;

      const user = await User.findById(req.body!.id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "No user found!",
        });
      }

      const createPost = new Post({
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
