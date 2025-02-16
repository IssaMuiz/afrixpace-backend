import Post from "../models/post-schema";
import User from "../models/user-schema";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

export const createPost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, content, category } = req.body;

      const file = req.file;

      console.log(file);

      if (!title || !content || !category) {
        res.status(400).json({
          success: false,
          message: "All fields are required!",
        });
        return;
      }

      let mediaType: "image" | "video" | null = null;
      let mediaUrl: string | null = null;
      let mediaPublicId: string | null = null;

      if (file) {
        if (file.mimetype.startsWith("image/")) {
          mediaType = "image";
        } else if (file.mimetype.startsWith("video/")) {
          mediaType = "video";
        } else {
          res
            .status(400)
            .json({ success: false, message: "Invalid media type" });
          return;
        }
      }

      mediaUrl = file!.path;
      mediaPublicId = file!.filename;

      const createPost = new Post({
        user: req.user?.id,
        title,
        content,
        category,
        media: {
          url: mediaUrl,
          mediaTypes: mediaType,
          public_Id: mediaPublicId,
        },
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

export const updatePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, content, category } = req.body;

      const file = req.file;

      const updatedPost = await Post.findByIdAndUpdate({
        user: req.user?.id,
        title,
        content,
        category,
        media: {
          url: mediaUrl,
          mediaTypes: mediaType,
        },
      });

      res.status(200).json({
        success: true,
        message: "Post updated successfully",
        updatedPost,
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

export const deletePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {}
);
