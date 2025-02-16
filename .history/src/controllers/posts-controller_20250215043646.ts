import Post from "../models/post-schema";
import User from "../models/user-schema";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

export const createPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { title, content, media } = req.body;

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
    });

    await createPost.save();

    res.status(200).json({
      success: true,
      message: "Post created successfully!",
      createPost,
    });
  }
);
