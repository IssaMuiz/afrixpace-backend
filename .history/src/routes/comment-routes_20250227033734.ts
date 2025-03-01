import express from "express";
import {
  addComment,
  getComments,
  deleteComment,
  toggleLikeComment,
  replyComment,
  updateCommentReply,
  updateComment,
} from "../controllers/comment-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

router.post("/", authMiddleware, addComment);
router.post("/:postId/reply", authMiddleware, replyComment);
router.get("/:postId", authMiddleware, getComments);
router.delete("/:commentId", authMiddleware, deleteComment);
router.put("/:commentId/like", authMiddleware, toggleLikeComment);
router.put("/:replyCommentId/reply", authMiddleware, updateCommentReply);
router.put("/:commentId", authMiddleware, updateComment);

export default router;
