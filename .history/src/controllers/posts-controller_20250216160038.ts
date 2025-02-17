import Post from "../models/post-schema";
import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import io from "../app";

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
          publicId: mediaPublicId,
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

export const upvotePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { postId } = req.params;
    const userId = req.user?.id;

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post!.downvotes = post!.downvotes.filter((id) => id.toString() !== userId);

    if (post?.upvotes.includes(userId)) {
      post.upvotes = post.upvotes.filter((id) => id.toString() !== userId);
    } else {
      post?.upvotes.push(userId);
    }

    await post?.save();

    await Post.findByIdAndUpdate(
      postId,
      { $inc: { votesCount: 1 } },
      { new: true }
    );

    io.emit("voteUpdates", { postId, upvotes: post?.upvotes.length });
    res.status(200).json({
      success: true,
      message: "Upvotes a post!",
    });
  }
);

export const downvotePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { postId } = req.params;
    const userId = req.user?.id;

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post!.upvotes = post!.upvotes.filter((id) => id.toString() !== userId);

    if (post?.downvotes.includes(userId)) {
      post.downvotes = post.downvotes.filter((id) => id.toString() !== userId);
    } else {
      post?.downvotes.push(userId);
    }

    await post?.save();

    await Post.findByIdAndUpdate(
      postId,
      { $inc: { votesCount: -1 } },
      { new: true }
    );
    io.emit("voteUpdates", { postId, downvotes: post?.downvotes.length });

    res.status(200).json({
      success: true,
      message: "Downvotes a post!",
    });
  }
);

export const updatePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { postId } = req.params;
      const { title, content, category } = req.body;
      const userId = req.user?.id;
      const file = req.file;

      const post = await Post.findById(postId);

      if (!post) {
        res.status(404).json({
          success: false,
          message: "Post not found!",
        });
      }

      if (post?.user.toString() !== userId) {
        res.status(400).json({
          success: false,
          message: "Unauthorized",
        });
      }

      let mediaUrl: string | null = null;
      let mediaType: string | null = null;
      let publicId: string | null = null;

      if (file) {
        if (post?.media.publicId) {
          await cloudinary.uploader.destroy(post.media.publicId);
        }
        if (file.mimetype.startsWith("image/")) {
          mediaType = "image";
        } else if (file.mimetype.startsWith("video/")) {
          mediaType = "video";
        } else {
          res.status(401).json({
            success: false,
            message: "Invalid media type",
          });
        }
      }

      mediaUrl = file!.path;
      publicId = file!.filename;

      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          user: req.user?.id,
          title,
          content,
          category,
          media: {
            url: mediaUrl,
            mediaTypes: mediaType,
            public_id: publicId,
          },
        },
        { new: true }
      );

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

export const getPostByCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { category } = req.params;

    const post = await Post.find({ category })
      .populate("user", "username image")
      .populate("upvotes", "username")
      .populate("downvotes", "username")
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "username image",
        },
      })
      .populate({
        path: "comments",
        populate: {
          path: "likes",
          select: "username",
        },
      })
      .populate({
        path: "comments",
        populate: {
          path: "replies",
          populate: {
            path: "userId",
            select: "username image",
          },
        },
      })
      .exec();

    res.status(200).json(post);
  }
);

export const getFeed = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { sortBy } = req.query as { sortBy?: "recent" | "popular" };

    const sortQuery: Record<string, number> = {};

    if (sortBy === "popular") {
      sortQuery.commentCount = -1;
      sortQuery.upvotes = -1;
    } else {
      sortQuery.createdAt = -1;
    }

    const post = await Post.find()
      .populate("user", "username image")
      .sort(sortQuery as any)
      .exec();

    res.status(200).json(post);
  }
);

export const deletePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;

      const post = await Post.findById(postId);

      if (!post) {
        res.status(404).json({
          success: false,
          message: "Post not found!",
        });
      }

      if (post?.user.toString() !== userId) {
        res.status(400).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const deletePost = await Post.findByIdAndDelete(postId);

      if (req.file) {
        if (post?.media.publicId) {
          await cloudinary.uploader.destroy(post.media.publicId);
        }
      }

      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
        deletePost,
      });
    } catch (error) {}
  }
);
