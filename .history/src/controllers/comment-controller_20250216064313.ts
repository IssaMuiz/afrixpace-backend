import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Comment from "../models/comment-schema";
import Post from "../models/post-schema";

export const addComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
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

    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    res.status(200).json({
      success: true,
      newComment,
    });
  }
);

export const getComments = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { postId } = req.params;

    const comments = await Comment.find({ postId, isDeleted: false })
      .populate("userId", "username", "image")
      .populate({ path: "parentComment", select: "content userId" })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      comments,
    });
  }
);

export const deleteComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
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

    comment!.isDeleted = true;

    res.status(200).json({
      success: false,
      message: "Comment deleted successfully",
      comment,
    });
  }
);

export const toggleLikeComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
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

    res.status(200).json({
      message: "Comment like status updated",
    });
  }
);
