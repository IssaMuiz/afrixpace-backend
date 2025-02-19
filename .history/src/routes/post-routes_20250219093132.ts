import express from "express";
import {
  createPost,
  deletePost,
  downvotePost,
  getFeed,
  getPostByCategory,
  updatePost,
  upvotePost,
} from "../controllers/posts-controller";
import { authMiddleware } from "../middlewares/auth-middleware";
import upload from "../middlewares/upload";
import { validatePost } from "../middlewares/validation";

const router = express.Router();

router.post(
  "/create-post",
  authMiddleware,
  validatePost,
  upload.single("media"),
  createPost
);
router.put("/:postId", authMiddleware, upload.single("media"), updatePost);
router.delete("/:postId", authMiddleware, upload.single("media"), deletePost);
router.get("/category", getPostByCategory);
router.get("/feed", getFeed);
router.put("/:postId/upvotes", authMiddleware, upvotePost);
router.put("/:postId/downvotes", authMiddleware, downvotePost);

export default router;
