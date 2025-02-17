import express from "express";
import {
  addComment,
  getComments,
  deleteComment,
  toggleLikeComment,
  replyComment,
} from "../controllers/comment-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = express.Router();

router.post("/", authMiddleware, addComment);
router.post("/reply", replyComment);
router.get("/:postId", getComments);
router.delete("/:commentId", authMiddleware, deleteComment);
router.put("/:commentId/like", authMiddleware, toggleLikeComment);

export default router;
