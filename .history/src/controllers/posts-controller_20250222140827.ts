import Post from "../models/post-schema";
import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Server } from "socket.io";
/* import redis from "../config/redis";
 */ import { sendNotification } from "../utils/notification-helper";
import mongoose from "mongoose";
import { PerformanceObserverEntryList } from "perf_hooks";

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

      /*  await redis.del("posts"); */

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
    try {
      const io: Server = (req as any).io;

      const { postId } = req.params;
      const userId = req.user?.id;

      const post = await Post.findById(postId);

      if (!post) {
        res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      const alreadyUpvoted = post?.upvotes.includes(userId);
      const alreadyDownvoted = post?.downvotes.includes(userId);

      let voteChange = 0;

      if (alreadyUpvoted) {
        await Post.findByIdAndUpdate(postId, {
          $pull: { upvotes: userId },
          $inc: { votesCount: -1 },
        });

        voteChange = -1;
      } else {
        await Post.findByIdAndUpdate(postId, {
          $pull: { downvotes: userId },
          $addToSet: { upvotes: userId },
          $inc: { votesCount: alreadyDownvoted ? 2 : 1 },
        });
        voteChange = alreadyDownvoted ? 2 : 1;
      }

      sendNotification(
        post!.user?._id,
        userId,
        "UPVOTE",
        `${req.user?.username} upvoted your post`,
        io,
        postId
      );

      const updatedPost = await Post.findById(postId);

      io.emit("voteUpdates", { postId, upvotes: post?.upvotes.length });
      res.status(200).json({
        success: true,
        message: "Upvotes a post!",
        votesCount: updatedPost?.votesCount,
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

export const downvotePost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const io: Server = (req as any).io;

      const { postId } = req.params;
      const userId = req.user?.id;

      const post = await Post.findById(postId);

      if (!post) {
        res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      const alreadyUpvoted = post?.upvotes.includes(userId);
      const alreadyDownvoted = post?.downvotes.includes(userId);

      let voteChange = 0;

      if (alreadyDownvoted) {
        await Post.findByIdAndUpdate(postId, {
          $pull: { downvotes: userId },
          $inc: { votesCount: 1 },
        });

        voteChange = 1;
      } else {
        await Post.findByIdAndUpdate(postId, {
          $pull: { upvotes: userId },
          $addToSet: { downvotes: userId },
          $inc: { votesCount: alreadyDownvoted ? -2 : -1 },
        });
        voteChange = alreadyUpvoted ? -2 : -1;
      }

      sendNotification(
        post!.user?._id,
        userId,
        "DOWNVOTE",
        `${req.user?.username} downvoted your post`,
        io,
        postId
      );

      const updatedPost = await Post.findById(postId);

      io.emit("voteUpdates", { postId, downvotes: post?.downvotes.length });

      res.status(200).json({
        success: true,
        message: "Downvotes a post!",
        votesCount: updatedPost?.votesCount,
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
    try {
      const cacheKey = "posts";

      /* const cahchedPosts = await redis.get(cacheKey); */

      /*  if (cacheKey) {
        res
          .status(200)
          .json({ fromCache: true, posts: JSON.parse(cahchedPosts!) });
      } */

      const { category, lastPostId, limit } = req.query;

      const postsLimit = parseInt(limit as string) || 10;

      if (!category || typeof category !== "string") {
        res.status(400).json({
          success: false,
          message: "Category is required!",
        });
      }

      let query: Record<string, any> = { category };

      if (lastPostId && mongoose.Types.ObjectId.isValid(lastPostId as string)) {
        query._id = { $lt: new mongoose.Types.ObjectId(lastPostId as string) };
      }

      const posts = await Post.find(query)
        .sort({ createdAt: -1 })
        .limit(postsLimit)
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
        });

      /* await redis.setex(cacheKey, 300, JSON.stringify(posts)); */

      res.status(200).json({
        success: true,
        nextCursor: posts.length ? posts[posts.length - 1]._id : null,
        fromCache: false,
        data: posts,
      });
    } catch (error) {
      console.error("Error fetching posts", error);

      res.status(500).json({
        success: false,
        message: "Something went wrong!",
      });
    }
  }
);

export const getFeed = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const cacheKey = "posts";

      /* const cahchedPosts = await redis.get(cacheKey); */

      /* if (cacheKey) {
        res
          .status(200)
          .json({ fromCache: true, posts: JSON.parse(cahchedPosts!) });
      } */
      const { sortBy, lastPostId, limit } = req.query;

      const postsLimit = parseInt(limit as string) || 10;

      let query = {};
      if (lastPostId) {
        query = { _id: { $lt: lastPostId } };
      }

      let sortQuery: Record<string, number> = { createdAt: -1 };

      if (sortBy === "popular") {
        sortQuery = { commentCount: -1 };
        sortQuery = { upvotes: -1 };
      } else {
        sortQuery.createdAt = -1;
      }

      const posts = await Post.find(query)
        .sort(sortQuery as any)
        .limit(postsLimit)
        .populate("user", "username image")
        .populate("comments", "userId content");

      /* await redis.setex(cacheKey, 300, JSON.stringify(posts)); */

      const formattedPost = posts.map((post) => ({
        _id: post._id,
        username: req.user,
        content: post.content,
        votesCount: post.votesCount || 0,

        userVote: post.upvotes.includes(userId)
          ? "upvotes"
          : post.downvotes.includes(userId)
          ? "downvotes"
          : null,
      }));

      res.status(200).json({
        success: true,
        nextCursor: formattedPost.length
          ? formattedPost[formattedPost.length - 1]._id
          : null,
        fromCache: false,
        data: formattedPost,
      });
    } catch (error) {
      console.error("Error fetching posts", error);

      res.status(500).json({
        success: false,
        message: "Something went wrong!",
      });
    }
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
