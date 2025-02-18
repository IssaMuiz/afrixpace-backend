import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Comment from "../models/comment-schema";
import Post from "../models/post-schema";
import io from "../app";
import mongoose from "mongoose";
import { sendNotification } from "../utils/notification-helper";
import { Server } from "socket.io";

export const addComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const io: Server = (req as any).io;

      const { postId, content, parentComment } = req.body;
      const userId = req.user?.id;

      if (!postId || !content) {
        res.status(400).json({
          success: false,
          message: "Post ID and content are required",
        });
      }

      const postExists = await Post.findById(postId);

      if (!postExists) {
        res.status(404).json({
          success: false,
          message: "Post not found!",
        });
      }

      const newComment = new Comment({
        userId,
        postId,
        content,
        parentComment: parentComment || null,
      });

      await newComment.save();

      sendNotification(
        postExists!.user._id,
        userId,
        "COMMENT",
        `${req.user?.username} commented on your post`,
        io,
        postId
      );

      await Post.findByIdAndUpdate(
        postId,
        { $push: { comments: newComment._id }, $inc: { commentCount: 1 } },
        { new: true }
      );

      io.emit("newComment", { postId, comment: newComment });

      res.status(200).json({
        success: true,
        newComment,
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

export const getComments = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { postId } = req.params;

      const comments = await Comment.find({ postId, isDeleted: false })
        .populate("userId", "username", "image")
        .populate({ path: "parentComment", select: "content userId" })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        comments,
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

export const updateComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
          userId,
          content,
        },
        { new: true }
      );

      if (!comment) {
        res.status(404).json({
          success: false,
          message: "Comment not found!",
        });
      }

      res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        comment,
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

export const deleteComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { commentId } = req.params;

      const userId = req.user?.id;

      const comment = await Comment.findById(commentId);

      if (!comment) {
        res.status(404).json({
          success: false,
          message: "Comment not found!",
        });
      }

      if (comment?.userId.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await Post.findByIdAndUpdate(comment?.postId, {
        $inc: { commentCount: -1 },
      });

      await Comment.findByIdAndDelete(commentId);

      res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
        comment,
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

export const toggleLikeComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const io: Server = (req as any).io;

      const { commentId } = req.params;

      const userId = req.user?.id;

      const comment = await Comment.findById(commentId);

      if (!comment) {
        res.status(404).json({
          success: false,
          message: "Comment not found!",
        });
      }

      if (comment?.likes.includes(userId)) {
        comment.likes = comment.likes.filter((id) => id.toString !== userId);
      } else {
        comment?.likes.push(userId);
      }

      await comment?.save();

      sendNotification(
        comment!.userId._id,
        userId,
        "LIKE",
        `${req.user?.username} liked your comment`,
        io
      );

      io.emit("likesUpdate", { commentId, likes: comment?.likes.length });

      res.status(200).json({
        message: "Comment like status updated",
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

export const replyComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const io: Server = (req as any).io;

      const { content, parentCommentId, postId } = req.body;
      const userId = req.user?.id;

      const parentComment = await Comment.findById(parentCommentId);

      if (!parentComment) {
        res.status(404).json({
          success: false,
          message: "Comment cannot be found!",
        });
      }

      const reply = new Comment({
        userId,
        postId,
        content,
        parentComment: parentCommentId,
        replies: [],
      });

      await reply.save();

      parentComment!.replies.push(reply._id as mongoose.Types.ObjectId);

      await parentComment?.save();

      sendNotification(
        parentComment!.userId._id,
        userId,
        "REPLY",
        `${req.user?.username} reply your comment`,
        io
      );

      res.status(200).json({
        success: true,
        reply,
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

export const updateCommentReply = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { replyCommentId } = req.params;
      const { content, parentCommentId } = req.body;
      const userId = req.user?.id;

      const comment = await Comment.findById(replyCommentId);

      if (!comment) {
        res.status(404).json({
          success: false,
          message: "Comment can't be found!",
        });
      }

      if (comment?.userId.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const updateReplyComment = await Comment.findByIdAndUpdate(
        replyCommentId,
        {
          userId,
          parentComment: parentCommentId,
          content,
          replies: [],
        },
        { new: true }
      );

      if (!updateReplyComment) {
        res.status(404).json({
          success: false,
        });
      }

      res.status(200).json({
        success: true,
        updateReplyComment,
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

export const deleteReplyComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { replyCommentId } = req.params;
      const userId = req.user?.id;

      const comment = await Comment.findById(replyCommentId);

      if (!comment) {
        res.status(404).json({
          success: false,
          message: "Comment can't be found!",
        });
      }

      if (comment?.userId.toString !== userId) {
        res.status(403).json({
          success: false,
          message: "Unauthorized!",
        });
      }

      const deleteComment = await Comment.findByIdAndDelete(replyCommentId);

      res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
        deleteComment,
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
