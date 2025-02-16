import express from "express";
import {
  createPost,
  deletePost,
  getFeed,
  getPostByCategory,
  updatePost,
} from "../controllers/posts-controller";
import { authMiddleware } from "../middlewares/auth-middleware";
import upload from "../middlewares/upload";

const router = express.Router();

router.post("/create-post", authMiddleware, upload.single("media"), createPost);
router.put("/:postId", authMiddleware, upload.single("media"), updatePost);
router.delete("/:postId", authMiddleware, upload.single("media"), deletePost);
router.get("/category/:category", getPostByCategory);
router.get("/feed", getFeed);

export default router;
